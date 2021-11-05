import got from 'got';
import * as _ from 'lodash';
import { RequestHandler } from 'express';

import { NPMPackage, NpmPackageResponse, PackagesData } from './types';

const CONSTS = {
  baseUrl: 'https://registry.npmjs.org',
  isValidSemanticVersion: new RegExp(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/gm)
}

/**
 * Attempts to retrieve package data from the npm registry and return it
 */

let data: PackagesData[] = [];


export const getPackage: RequestHandler = async function (req, res, next) {
  const { name, version } = req.params;
  try {

    await checkDependencies(name, version);
    const getData = buildData(name);

    return res.status(200).json(_.filter(getData, (npmPackage) => !_.isNil(npmPackage)));
  } catch (error) {
    console.log(error);
    return next()
  }
};

function getPackageDetails(name: string, version: string): Promise<NPMPackage> {
  return got(`${CONSTS.baseUrl}/${name}/${version}`).json();
};


async function checkDependencies(packageName: string, packageVersion: string) {
  // Get all the packages names i currently have in my array.
  const getNames = _.map(data, 'name');

  // Check if I already have data about the package.
  if (_.indexOf(getNames, packageName) === -1) {
    // If not, get the details
    const packageDetails = await getPackageDetails(packageName, packageVersion);
    const packageDependencies = packageDetails.dependencies;

    // Extract dependencies to array.
    const getDependencies = extractDependencies(packageDependencies);

    // Push the data.
    const packageData = { name: packageName, dependencies: packageDependencies, children: getDependencies };
    data.push(packageData);

    // For each dependency, get its dependencies.
    if (getDependencies.length !== 0) {

      for (let index = 0; index < getDependencies.length; index++) {
        const element = getDependencies[index];
        await checkDependencies(element.name, element.version);
      }
    }
  }
  return data;

};

function buildData(packageName: string) {
  return _.map(data, ((npmPackage) => {

    // For each children, find its dependency from the array we have (all dependencies).
    npmPackage.children = npmPackage.children.map((child) => {
      const getDependency = _.find(data, (dep) => dep.name == child.name);
      return {
        ...getDependency,
        name: child.name,
        version: child.version
      };
    });

    // Return only the package we have searched for.
    if (npmPackage.name == packageName) {
      return { ...npmPackage, dependencies: undefined };
    }
  }));
}

function extractDependencies(packageDependencies: NPMPackage['dependencies']) {
  let dependencies: { name: string; version: string; }[] = [];

  _.forIn(packageDependencies, (version, name) => {
    // Protect against regex exploits. 
    if (version?.length < 50) {

      // Clean the string before making a request.
      if (_.indexOf(version, '^') !== -1) {
        version = version.replace('^', '');
      } else if (_.indexOf(version, '-') !== -1) {
        version = version.split('-')[0];
      } else if (_.indexOf(version, '~') !== -1){
        version = version.split('~')[0];
      }

        // Check if the version is a semantic version.
        // Regex from - https://regex101.com/r/vkijKf/1 
        if (version.match(CONSTS.isValidSemanticVersion)) {
          version = version.trim();
          dependencies.push({ name, version });
        } else {
          console.info('Error while fetching details', 'Version is not a semantic version', 'extractDependencies', `${version}`);
        }
    }
  });

  return dependencies;
};