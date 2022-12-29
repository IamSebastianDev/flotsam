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
    quiet?: boolean;

    /**
     * @type { string }
     * @optional
     * @description
     * A string used as secret to encrypt the JSON Documents on disk. If no string is passed,
     * no encryption will take place.
     */

    auth?: string;
};
