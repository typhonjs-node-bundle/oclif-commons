const fs             = require("fs");
const path           = require("path");

const s_EXT_JS = new Map([['.js', 1], ['.jsx', 1], ['.es6', 1], ['.es', 1], ['.mjs', 1]]);
const s_EXT_TS = new Map([['.ts', 1], ['.tsx', 1]]);

const s_BABEL_CONFIG = new Map([['.babelrc', 1], ['.babelrc.cjs', 1], ['.babelrc.js', 1], ['.babelrc.mjs', 1],
 ['.babelrc.json', 1], ['babel.config.cjs', 1], ['babel.config.js', 1], ['babel.config.json', 1],
  ['babel.config.mjs', 1]]);

const s_TSC_CONFIG = new Map([['tsconfig.json', 1], ['jsconfig.json', 1]]);

/**
 * Provides a few utility functions to walk the local file tree.
 */
class FileUtil
{
   /**
    * Returns an array of all directories found from walking the directory tree provided.
    *
    * @param {string}   dir - Directory to walk.
    * @param {Array}    [skipDir] - An array of directory names to skip walking.
    * @param {Array}    [results] - Output array.
    *
    * @returns {Promise<Array>}
    */
   static async getDirList(dir = '.', skipDir = [], results = [])
   {
      for await (const p of FileUtil.walkDir(dir, skipDir))
      {
         results.push(path.resolve(p));
      }

      return results;
   }

   /**
    * Returns an array of all files found from walking the directory tree provided.
    *
    * @param {string}   dir - Directory to walk.
    * @param {Array}    [skipDir] - An array of directory names to skip walking.
    * @param {Array}    [results] - Output array.
    *
    * @returns {Promise<Array>}
    */
   static async getFileList(dir = '.', skipDir = [], results = [])
   {
      for await (const p of FileUtil.walkFiles(dir, skipDir))
      {
         results.push(path.resolve(p));
      }

      return results;
   }

   /**
    * Searches all files from starting directory skipping any directories in `skipDir` and those starting with `.`
    * in an attempt to locate a Babel configuration file. If a Babel configuration file is found `true` is
    * immediately returned.
    *
    * @param {string}   dir - Directory to walk.
    * @param {Array}    [skipDir] - An array of directory names to skip walking.
    *
    * @returns {Promise<boolean>} Whether a Babel configuration file was found.
    */
   static async hasBabelConfig(dir = '.', skipDir = [])
   {
      for await (const p of FileUtil.walkFiles(dir, skipDir))
      {
         if (s_BABEL_CONFIG.has(path.basename(p)))
         {
            return true;
         }
      }
      return false;
   }

   /**
    * Searches all files from starting directory skipping any directories in `skipDir` and those starting with `.`
    * in an attempt to locate a Typescript configuration file. If a configuration file is found `true` is
    * immediately returned.
    *
    * @param {string}   dir - Directory to walk.
    * @param {Array}    [skipDir] - An array of directory names to skip walking.
    *
    * @returns {Promise<boolean>} Whether a Typescript configuration file was found.
    */
   static async hasTscConfig(dir = '.', skipDir = [])
   {
      for await (const p of FileUtil.walkFiles(dir, skipDir))
      {
         if (s_TSC_CONFIG.has(path.basename(p)))
         {
            return true;
         }
      }
      return false;
   }

   /**
    * Tests if the given extension is a Javascript file extension type.
    *
    * @param {string}   extension - extension to test.
    *
    * @returns {boolean} True if JS extension type.
    */
   static isJS(extension)
   {
      return s_EXT_JS.has(extension);
   }

   /**
    * Tests if the given extension is a Typescript file extension type.
    *
    * @param {string}   extension - extension to test.
    *
    * @returns {boolean} True if TS extension type.
    */
   static isTS(extension)
   {
      return s_EXT_TS.has(extension);
   }

   /**
    * A generator function that walks the local file tree.
    *
    * @param {string}   dir - The directory to start walking.
    * @param {Array}    [skipDir] - An array of directory names to skip walking.
    *
    * @returns {any}
    */
   static async * walkDir(dir, skipDir = [])
   {
      const skipDirMap = new Map(skipDir.map((entry) => { return [entry, 1]; }));

      for await (const d of await fs.promises.opendir(dir))
      {
         // Skip directories in `skipMap` or any hidden directories (starts w/ `.`).
         if (d.isDirectory() && (skipDirMap.has(d.name) || d.name.startsWith('.')))
         {
            continue;
         }

         const entry = path.join(dir, d.name);

         if (d.isDirectory())
         {
            yield entry;
            yield* FileUtil.walkDir(entry);
         }
      }
   }

   /**
    * A generator function that walks the local file tree.
    *
    * @param {string}   dir - The directory to start walking.
    * @param {Array}    skipDir - An array of directory names to skip walking.
    *
    * @returns {any}
    */
   static async * walkFiles(dir, skipDir = [])
   {
      const skipDirMap = new Map(skipDir.map((entry) => { return [entry, 1]; }));

      for await (const d of await fs.promises.opendir(dir))
      {
         // Skip directories in `skipMap` or any hidden directories (starts w/ `.`).
         if (d.isDirectory() && (skipDirMap.has(d.name) || d.name.startsWith('.')))
         {
            continue;
         }

         const entry = path.join(dir, d.name);

         if (d.isDirectory())
         {
            yield* FileUtil.walkFiles(entry);
         }
         else if (d.isFile())
         {
            yield entry;
         }
      }
   }
}

module.exports = FileUtil;