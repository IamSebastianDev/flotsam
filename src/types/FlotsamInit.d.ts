/** @format */

export type FlotsamLogInit = {
    /**
     * @type { string }
     * @optional
     * @description
     * Path where the logfile will be created. If no value is passed, no logfile will be created.
     */
    path?: string;
    /**
     * @type { boolean }
     * @optional
     * @description
     * Boolean indicating if logs & warnings should be suppressed.
     */
    quiet?: boolean;
    /**
     * @type { number }
     * @optional
     * @description
     * Number setting the maximum filesize of the logfile. If the logfile exceeds the maximum allowed size,
     * it will be truncated.
     */
    maxSafeFileSize?: number;
};

export type FlotsamAuthInit = {
    /**
     * @type { string }
     * @description
     * String used as key to encrypt the files on disk
     */
    key: string;
    /**
     * @type { boolean }
     * @description
     * Flag indicating if the files on disk should be encrypted using the
     * predefined encryption strategy and passed secret key.
     */
    useEncryption: boolean;
};

export type FlotsamStorageInit = {
    /**
     * @type { string }
     * @optional
     * @description
     * Absolute path of the location where the files will be stored. This will default to the
     * operating systems general storage space if not otherwise set.
     */
    dir?: string;
    /**
     * @type { boolean }
     * @optional
     * @description
     * Flag indicating if the physical storage for the JSON Documents created should be localized to the project
     * or use the operating systems home directory as root directory.
     */
    useProjectStorage?: boolean;
};

export type FlotsamInit = {
    /**
     * @type { FlotsamLogInit }
     * @optional
     * @description
     * An object describing the properties setting up the logging mechanism for
     * the database instance
     */
    log?: FlotsamLogInit;
    /**
     * @type { FlotsamAuthInit }
     * @optional
     * @description
     * An object describing the properties setting up the authentication mechanism for
     * the database instance. If undefined, no authentication and encryption will take
     * place
     */
    auth?: FlotsamAuthInit;
    /**
     * @type { FlotsamStorageInit }
     * @optional
     * @description
     * An object describing the properties setting up the storage mechanism for
     * the database instance.
     */
    storage?: FlotsamStorageInit;
};
