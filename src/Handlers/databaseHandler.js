
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath =
  path.join(__dirname, '..', 'Data', 'profiles.db');

// ========================================
// CREATE DATA FOLDER
// ========================================

if (
  !fs.existsSync(
    path.join(__dirname, '..', 'Data')
  )
) {

  fs.mkdirSync(
    path.join(__dirname, '..', 'Data')
  );

}

// ========================================
// DATABASE
// ========================================

const db =
  new sqlite3.Database(dbPath);

// ========================================
// PLOTS
// ========================================

const plots = [

  {
    id: 1,
    name: 'Plot 1',
    row: 1,
    col: 1,
    multiplier: 3,
    cost: 1000000000000,
    ownedByDefault: false
  },

  {
    id: 2,
    name: 'Plot 2',
    row: 1,
    col: 2,
    multiplier: 5,
    cost: 99000000000000,
    ownedByDefault: false
  },

  {
    id: 3,
    name: 'Plot 3',
    row: 1,
    col: 3,
    multiplier: 3,
    cost: 100000000000,
    ownedByDefault: false
  },

  {
    id: 4,
    name: 'Plot 4',
    row: 2,
    col: 1,
    multiplier: 2,
    cost: 500000000,
    ownedByDefault: false
  },

  {
    id: 5,
    name: 'Plot 5',
    row: 2,
    col: 2,
    multiplier: 2,
    cost: 100000000,
    ownedByDefault: false
  },

  {
    id: 6,
    name: 'Plot 6',
    row: 2,
    col: 3,
    multiplier: 2,
    cost: 2500000,
    ownedByDefault: false
  },

  {
    id: 7,
    name: 'Plot 7',
    row: 3,
    col: 1,
    multiplier: 1,
    cost: 500000,
    ownedByDefault: false
  },

  {
    id: 8,
    name: 'Plot 8',
    row: 3,
    col: 2,
    multiplier: 1,
    cost: 50000,
    ownedByDefault: false
  },

  {
    id: 9,
    name: 'Plot 9',
    row: 3,
    col: 3,
    multiplier: 1,
    cost: 150000,
    ownedByDefault: false
  },

  {
    id: 10,
    name: 'Plot 10',
    row: 4,
    col: 1,
    multiplier: 1,
    cost: 20000,
    ownedByDefault: false
  },

  {
    id: 11,
    name: 'Plot 11',
    row: 4,
    col: 2,
    multiplier: 1,
    cost: 0,
    ownedByDefault: true,
    isEntrance: true
  },

  {
    id: 12,
    name: 'Plot 12',
    row: 4,
    col: 3,
    multiplier: 1,
    cost: 5000,
    ownedByDefault: false
  }

];

// ========================================
// TABLES
// ========================================

db.serialize(() => {

  // ========================================
  // PROFILES
  // ========================================

  db.run(`

    CREATE TABLE IF NOT EXISTS profiles (

      userId TEXT PRIMARY KEY,

      username TEXT,

      cash REAL DEFAULT 0,

      cash_boost INTEGER DEFAULT 100,

      offline_gas_boost INTEGER DEFAULT 100,

      base_gas_per_second REAL DEFAULT 0,
      
      base_energy_per_second REAL DEFAULT 0,

      unlocked_plots TEXT DEFAULT '[11]',

      created_at INTEGER,

      updated_at INTEGER

    )

  `);

  // ========================================
  // AREA ALLOCATIONS
  // ========================================

  db.run(`

    CREATE TABLE IF NOT EXISTS area_allocations (

      userId TEXT PRIMARY KEY,

      plot1 REAL DEFAULT 0,
      plot2 REAL DEFAULT 0,
      plot3 REAL DEFAULT 0,
      plot4 REAL DEFAULT 0,
      plot5 REAL DEFAULT 0,
      plot6 REAL DEFAULT 0,
      plot7 REAL DEFAULT 0,
      plot8 REAL DEFAULT 0,
      plot9 REAL DEFAULT 0,
      plot10 REAL DEFAULT 0,
      plot11 REAL DEFAULT 0,
      plot12 REAL DEFAULT 0,

      FOREIGN KEY(userId)
      REFERENCES profiles(userId)

    )

  `);

});

// ========================================
// GET PROFILE
// ========================================

function getProfile(userId) {

  return new Promise((resolve, reject) => {

    db.get(
      'SELECT * FROM profiles WHERE userId = ?',
      [userId],
      (err, row) => {

        if (err)
          reject(err);

        resolve(row);

      }
    );

  });

}

// ========================================
// GET AREA ALLOCATION
// ========================================

function getAreaAllocation(userId) {

  return new Promise((resolve, reject) => {

    db.get(
      'SELECT * FROM area_allocations WHERE userId = ?',
      [userId],
      (err, row) => {

        if (err)
          reject(err);

        resolve(row);

      }
    );

  });

}

// ========================================
// GET ALL PROFILES
// ========================================

function getAllProfiles() {

  return new Promise((resolve, reject) => {

    db.all(
      'SELECT * FROM profiles ORDER BY username',
      (err, rows) => {

        if (err)
          reject(err);

        resolve(rows);

      }
    );

  });

}

// ========================================
// CREATE OR UPDATE PROFILE
// ========================================

function createOrUpdateProfile(
  userId,
  username,
  data
) {

  return new Promise((resolve, reject) => {

    const now = Date.now();

    db.get(
      'SELECT * FROM profiles WHERE userId = ?',
      [userId],
      (err, row) => {

        if (err) {
          reject(err);
          return;
        }

        // ========================================
        // UPDATE
        // ========================================

        if (row) {

          db.run(

            `UPDATE profiles

             SET
               username = ?,
               cash = COALESCE(?, cash),
               cash_boost = COALESCE(?, cash_boost),
               offline_gas_boost = COALESCE(?, offline_gas_boost),
               base_gas_per_second = COALESCE(?, base_gas_per_second),
               base_energy_per_second = COALESCE(?, base_energy_per_second),
               updated_at = ?

             WHERE userId = ?`,

            [

              username,

              data.cash,

              data.cash_boost,

              data.offline_gas_boost,

              data.base_gas_per_second,

              data.base_energy_per_second,

              now,

              userId


            ],

            (err) => {

              if (err) {
                reject(err);
              } else {
                resolve(true);
              }

            }

          );

        }

        // ========================================
        // INSERT
        // ========================================

        else {

          db.run(

            `INSERT INTO profiles (

              userId,
              username,
              cash,
              cash_boost,
              offline_gas_boost,
              base_gas_per_second,
              base_energy_per_second,
              unlocked_plots,
              created_at,
              updated_at

            )

           
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

            `,

            [

              userId,

              username,

              data.cash || 0,

              data.cash_boost || 100,

              data.offline_gas_boost || 100,

              
              data.base_gas_per_second || 0,

              data.base_energy_per_second || 0,

              JSON.stringify([11]),



              now,

              now

            ],

            (err) => {

              if (err) {
                reject(err);
              } else {
                resolve(true);
              }

            }

          );

        }

      }
    );

  });

}

// ========================================
// UPDATE PROFILE
// ========================================

function updateProfile(userId, data) {

  return new Promise((resolve, reject) => {

    const now = Date.now();

    const updates = [];

    const values = [];

    if (data.cash !== undefined) {

      updates.push('cash = ?');

      values.push(data.cash);

    }

    if (data.cash_boost !== undefined) {

      updates.push('cash_boost = ?');

      values.push(data.cash_boost);

    }

    if (data.offline_gas_boost !== undefined) {

      updates.push('offline_gas_boost = ?');

      values.push(data.offline_gas_boost);

    }

    if (data.base_gas_per_second !== undefined) {

      updates.push('base_gas_per_second = ?');

      values.push(data.base_gas_per_second);

    }

    if (data.base_energy_per_second !== undefined) {

       updates.push('base_energy_per_second = ?');
       values.push(data.base_energy_per_second);

    }



    if (updates.length === 0) {

      resolve(false);

      return;

    }

    updates.push('updated_at = ?');

    values.push(now);

    values.push(userId);

    db.run(

      `UPDATE profiles
       SET ${updates.join(', ')}
       WHERE userId = ?`,

      values,

      (err) => {

        if (err)
          reject(err);

        resolve(true);

      }

    );

  });

}

// ========================================
// DELETE PROFILE
// ========================================

function deleteProfile(userId) {

  return new Promise((resolve, reject) => {

    // Delete area allocations first
    db.run(

      'DELETE FROM area_allocations WHERE userId = ?',

      [userId],

      (err) => {

        if (err) {

          reject(err);

          return;

        }

        // Delete profile
        db.run(

          'DELETE FROM profiles WHERE userId = ?',

          [userId],

          (err) => {

            if (err) {

              reject(err);

            } else {

              resolve(true);

            }

          }

        );

      }

    );

  });

}

// ========================================
// MODULE EXPORTS
// ========================================

module.exports = {

  db,

  plots,

  getProfile,

  getAreaAllocation,

  getAllProfiles,

  createOrUpdateProfile,

  updateProfile,

  deleteProfile

};

