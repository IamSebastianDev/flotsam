/** @format */

export type FlotsamInit = {
    /**
     * @type { string }
     * @description
     * String describing the root of the directory used to store the JSON documents.
     */
    root: string;

    /**
     * @type { string }
     * @optional
     * @description
     * If a string is passed as property, the string will be used as location for a log file,
     * where all errors are logged to.
     */
    log?: string;

    /**
     * @type { boolean }
     * @optional
     * @description
     * Boolean indicating if logs & warnings should be suppressed.
     */
    quiet?: string;

    /**
     * @type { string }
     * @optional
     * @description
     * Object containing auth properties to use for encrypting the data stored on disk
     */

    auth?: string;
};
