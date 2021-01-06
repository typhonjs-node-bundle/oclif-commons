/**
 * Creates a non fatal error which doesn't trigger the CLI fatal error handling. A non-fatal "error" stops control
 * flow and may provide an appropriate log level for typhonjs-color-logger ('fatal', 'error', 'warn', 'info',
 * 'verbose', 'debug', 'trace').
 */
class NonFatalError extends Error
{
   /**
    * Stores a message and defines optional log level and error code.
    *
    * @param {string}   message - Error message
    * @param {string}   [logLevel='error] - The typhonjs-color-logger log level.
    * @param {number}   [errorCode=1] - The integer error code number. Automatically assigned from log level or `1`.
    */
   constructor(message, logLevel = 'error', errorCode = 1)
   {
      super(message);

      this.$$bundler_fatal = false;

      // Sanitize incoming data.
      let logEvent = 'log:error';
      errorCode = Number.isInteger(errorCode) ? errorCode : 1;

      // Set logEvent and errorCode based on logLevel.
      if (typeof logLevel === 'string')
      {
         switch (logLevel)
         {
            case 'fatal':
               logEvent = 'log:fatal';
               errorCode = 2;
               break;

            case 'error':
               logEvent = 'log:error';
               errorCode = 1;
               break;

            case 'warn':
               logEvent = 'log:warn';
               errorCode = 0;
               break;

            case 'info':
               logEvent = 'log:info';
               errorCode = 0;
               break;

            case 'verbose':
               logEvent = 'log:verbose';
               errorCode = 0;
               break;

            case 'debug':
               logEvent = 'log:debug';
               errorCode = 0;
               break;

            case 'trace':
               logEvent = 'log:trace';
               errorCode = 3;
               break;
         }
      }

      this.$$logEvent = logEvent;
      this.$$errorCode = errorCode;
   }
}

module.exports = NonFatalError;