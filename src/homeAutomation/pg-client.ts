import {Pool} from 'pg';

export const pool = new Pool({
  host: 'localhost',
  database: 'promitor',
  user: 'promitor',
  password: 'postgresDBforPromitor',
  port: 5432,
});

// the pool will emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

