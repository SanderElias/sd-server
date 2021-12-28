import { pool } from './src/homeAutomation/pg-client';
import { types } from 'pg';

const query = {
  text: 'select * from tempratures ORDER BY prim DESC LIMIT 30',
  rowMode: 'array',
};

//types //?

pool.query(query).then((res) => {
  res.rows[0].forEach((e) => {
    console.log(e, typeof e);
  });
});
