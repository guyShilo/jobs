import { useEffect, useState } from 'react'
import { TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';

import axios from 'axios';
import _ from 'lodash';


interface SearchProps { setSearch: React.Dispatch<React.SetStateAction<string>> };

export const Search: React.FC<SearchProps> = ({ setSearch }) => {
  const [options, setOptions] = useState<{ name: string }[]>([]);
  const [slug, setSlug] = useState('snyk');

  const getSlug = async (slug: string) => {
    const { data } = await axios.get(`https://registry.npmjs.org/-/v1/search?size=10&from=0&text=${slug}`);
    return _.map(data.objects, (object) => {
      return {
        name: object.package.name
      }
    });
  };

  useEffect(() => {
    getSlug(slug).then(response => {
      setOptions(response);
    });
  }, [slug]);

  return (
    <Autocomplete
      disablePortal
      fullWidth
      options={options}
      getOptionLabel={(option: { name: string }) => {
        setSearch(option.name);
        return option.name;
      }}
      renderInput={(params) => <TextField
        onChange={(event) => {
          setSlug(event.target.value);
        }}
        {...params} label="Please select a Package" />}
    />
  );
}