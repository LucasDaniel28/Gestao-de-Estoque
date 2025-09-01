import { HikvisionConfig, Patient } from '../types';
export interface HikvisionResponse {
    statusCode?: number;
    statusString?: string;
    subStatusCode?: string;
    id?: string;
    responseStatus?: string;
    responseStatusStrg?: string;
    errorMsg?: string | undefined;
    rawResponse?: string;
}
export interface HikvisionUser {
    employeeNo: string;
    name: string;
    userType: number;
    localRight: number;
    userVerifyMode: number;
    rightPlan: number;
    maxOpenDoorTime: number;
    openDoorTime: number;
    roomNumber: string;
    floorNumber: string;
    userValidBeginTime: string;
    userValidEndTime: string;
    userValidTimeType: number;
    userValidCount: number;
}
export declare class HikvisionClient {
    private client;
    private config;
    constructor(config: HikvisionConfig);
    getUrl(path: string): string;
    private processImage;
    private patientToHikvisionUser;
    parseHikvisionResponse(response: any): Promise<{
        success: boolean;
        data: any;
        format: string;
        error?: never;
    } | {
        success: boolean;
        error: string;
        data?: never;
        format?: never;
    }>;
    extractXmlData(xmlString: string, tagName: string): string | null;
    listUsers(): Promise<HikvisionUser[]>;
    createUser(patient: Patient): Promise<HikvisionResponse>;
    updateUser(employeeNo: string, patient: Patient): Promise<HikvisionResponse>;
    deleteUser(employeeNo: string): Promise<HikvisionResponse>;
    uploadFaceDataRecord({ employeeNo, imagePath, FDID, faceLibType }: {
        employeeNo: string;
        imagePath: string;
        FDID?: string;
        faceLibType?: string;
    }): Promise<any>;
    deleteFace(faceId: string, FDID?: string): Promise<HikvisionResponse>;
    checkDeviceStatus(): Promise<boolean>;
    getDeviceInfo(): Promise<any>;
    listFaceLibraries(): Promise<any[]>;
    uploadFacePictureLibrary({ name, customHumanID, imagePath, FDID, sex, bornTime, certificateType, certificateNumber, phoneNumber }: {
        name: string;
        customHumanID: string;
        imagePath: string;
        FDID?: string;
        sex?: 'male' | 'female' | 'unknown';
        bornTime?: string;
        certificateType?: string;
        certificateNumber?: string;
        phoneNumber?: string;
    }): Promise<any>;
    createFaceLibrary({ id, name, maxCapacity, faceThreshold, customInfo, customFaceLibID, autoUpdata, qualityThreshold }: {
        id: string;
        name: string;
        maxCapacity?: number;
        faceThreshold?: number;
        customInfo?: string;
        customFaceLibID?: string;
        autoUpdata?: boolean;
        qualityThreshold?: number;
    }): Promise<HikvisionResponse>;
    uploadFaceDataRecordXml({ FDID, FPID, imagePath, faceLibType }: {
        FDID?: string;
        FPID: string;
        imagePath: string;
        faceLibType?: string;
    }): Promise<HikvisionResponse>;
    getClient(): any;
}
//# sourceMappingURL=hikvisionClient.d.ts.map