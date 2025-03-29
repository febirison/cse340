const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://cse340_v1:KPUggH8bcFsTznYv2nrVa3gfx5Trmlwi@dpg-cvcvg156l47c73ehf0q0-a.oregon-postgres.render.com/cse340_v1_uzad',
  ssl: { rejectUnauthorized: false } // Required for some Render DBs
});

client.connect()
  .then(() => {
    console.log('Connected to the database successfully!');
  })
  .catch(err => {
    console.error('Connection error:', err.stack);
  })
  .finally(() => client.end());