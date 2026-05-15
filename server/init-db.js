import { initDatabase } from './db/schema.js';

console.log('🚀 Initializing database...');

initDatabase()
  .then(db => {
    console.log('✅ Database initialized successfully!');
    db.close();
    console.log('🔒 Database connection closed.');
  })
  .catch(err => {
    console.error('❌ Database initialization failed:', err);
    process.exit(1);
  });