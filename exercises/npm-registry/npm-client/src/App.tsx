import { useEffect, useState } from 'react';
import './App.css';

import axios from 'axios';

import Tree from 'react-d3-tree';
import { Search } from './Search';
import { CircularProgress } from '@material-ui/core';
import _ from 'lodash';

export interface PackagesData {
  name: string;
  children: {
    name: string;
    children?: {
      name: string;
    }[];
  }[]
}

function App() {
  const [packages, setPackages] = useState<PackagesData>({ name: 'snyk', children: [] });
  const [packageToSearch, setPackageToSearch] = useState('snyk');

  const [loading, setLoading] = useState(true);

  const makeRequest = async (name: string, version: string) => {
    const baseUrl = `http://${window.location.hostname}:3000/package`;

    try {

      setLoading(true);
      if (_.indexOf(name, '/') !== -1 && _.indexOf(name, '@') !== -1) {
        name = name.split('/')[1];
      }

      const { data } = await axios.get(`${baseUrl}/${name}/${version}`);

      return data;
    } catch (error) {
      console.log(error);
    }
  };

  const getMainPackage = async (name: string, version: string) => {
    if (name === packageToSearch) {
      const data = await makeRequest(name, version);
      setLoading(false);
      return data;
    }
    return {}
  };

  useEffect(() => {
    setTimeout(async () => {
      const data = await getMainPackage(packageToSearch, 'latest');
      setPackages(data[0]);
    }, 6000);
  }, [packages]);

return (
  <div id="App" >
    <div className='autoComplete'>
      <Search setSearch={setPackageToSearch} />
    </div>

    <div style={{ width: '50em', height: '40em' }}>
      {loading ? <Loader /> : (
        <Tree data={packages} orientation='vertical' translate={{ x: 350, y: 100 }} pathFunc='step'
          rootNodeClassName="node__root"
          branchNodeClassName="node__branch"
          leafNodeClassName="node__leaf"
        />
      )}
    </div>
    <ScrollToMove />
    <MadeBy />
  </div>
);
}

const MadeBy = () => (
  <div className='madeBy'>
    <span>Made by Guy Shilo for </span>
    <img src="https://snyk.io/wp-content/themes/snyk_v2_etyhadar/dist/images/svg/snyk-wordmark.svg" alt="Snyk|Open Source Security Platform" ></img>
  </div>
)

const ScrollToMove = () => {
  const scrollToViewStyles: React.CSSProperties = { position: 'absolute', color: 'white', padding: '1rem', fontWeight: 'bold' };

  return (
    <>
      <div style={{ ...scrollToViewStyles, right: 0 }}>
        Drag to move the tree.
      </div>
      <div style={{ ...scrollToViewStyles, left: 0 }}>
        Drag to move the tree.
      </div></>
  )
}

const Loader = () => {
  return (
    <CircularProgress color="secondary" />
  );
}

export default App;
