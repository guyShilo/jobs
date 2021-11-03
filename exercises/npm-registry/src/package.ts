import got from 'got';
import * as _ from 'lodash';
import { RequestHandler } from 'express';

import { NPMPackage, PackagesData } from './types';

const CONSTS = {
  baseUrl: 'https://registry.npmjs.org',
  isValidSemanticVersion: new RegExp(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/gm)
}

/**
 * Attempts to retrieve package data from the npm registry and return it
 */
export const getPackage: RequestHandler = async function (req, res, next) {
  const { name, version } = req.params;

  try {

    const npmPackage = await getPackageDetails(name, version);;

    const getPackagesData = async function (packageDependencies: NPMPackage['dependencies']) {
      const packagesData: PackagesData = { name: npmPackage.name, dependencies: npmPackage.dependencies, children: [] };

      // Get the main package details in order to later map the children.
      const mainPackageDeps = extractDependencies(npmPackage.name, packageDependencies);
      const getMainDependencyDetails = _.map(mainPackageDeps.dependencies, async (dependency) => {
        const response = await getPackageDetails(dependency.name, dependency.version);
        packagesData.children.push({ name: response.name, dependencies: response.dependencies, children: [] });
      });
      await Promise.all(getMainDependencyDetails);

      // Map the children and for each children get the next one.
      const getChildrenDependencies = _.map(packagesData.children, async (child) => {
        const getGrandchildren = extractDependencies(child.name, child.dependencies);

        child.children = await Promise.all(_.map(getGrandchildren.dependencies, async (dependency) => {
          try {

            const response = await getPackageDetails(dependency.name, dependency.version);
            return { name: response.name, dependencies: response.dependencies };
          } catch (error) {

            console.info('Error while fetching details', JSON.stringify(error, null, 2), 'getGrandchildren-dependencies', `${dependency.name}`);
            return { name: `Error: ${dependency.name}`, dependencies: null };
          }
        }));
      });
      await Promise.all(getChildrenDependencies);

      return packagesData;
    }


    return res.status(200).json({
      message: `Package ${name}, version ${version} retrieved successfully.`,
      payload: await getPackagesData(npmPackage.dependencies)
    });
  } catch (error) {
    return res.status(400).json({ message: 'Package was not found.', payload: { name, version } });
  }
};

function getPackageDetails(name: string, version: string): Promise<NPMPackage> {
  return got(`${CONSTS.baseUrl}/${name}/${version}`).json();
};

function extractDependencies(packageName: string, packageDependencies: NPMPackage['dependencies']) {
  let dependencies: { name: string; version: string; }[] = [];

  _.forIn(packageDependencies, (version, name) => {

    // Protect against regex exploits. 
    if (version.length < 50) {

      // Clean the string before making a request.
      if (_.indexOf(version, '^') !== -1) {
        version = version.replace('^', '');
      } else if (_.indexOf(version, '-') !== -1) {
        version = version.split('-')[0];
      } else if (_.indexOf(version, '*') !== -1) {
        version = 'latest';
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

  return { packageName, dependencies };
};
