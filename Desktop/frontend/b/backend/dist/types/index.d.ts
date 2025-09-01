export interface Patient {
    employeeNo: string;
    name: string;
    dateOfBirth?: string;
    gender?: 'M' | 'F' | 'O';
    phone?: string;
    email?: string;
    address?: string;
    emergencyContact?: string;
    bloodType?: string;
    allergies?: string;
    medicalHistory?: string;
    insurance?: string;
    registrationDate: string;
    status: 'active' | 'inactive' | 'discharged';
}
export interface PatientCreateRequest {
    employeeNo: string;
    name: string;
    dateOfBirth?: string;
    gender?: 'M' | 'F' | 'O';
    phone?: string;
    email?: string;
    address?: string;
    emergencyContact?: string;
    bloodType?: string;
    allergies?: string;
    medicalHistory?: string;
    insurance?: string;
}
export interface PatientUpdateRequest {
    name?: string;
    dateOfBirth?: string;
    gender?: 'M' | 'F' | 'O';
    phone?: string;
    email?: string;
    address?: string;
    emergencyContact?: string;
    bloodType?: string;
    allergies?: string;
    medicalHistory?: string;
    insurance?: string;
    status?: 'active' | 'inactive' | 'discharged';
}
export interface HikvisionUser {
    employeeNo: string;
    name: string;
    faceId?: string;
    cardNo?: string;
    userType?: number;
    localRight?: number;
    userVerifyMode?: number;
    rightPlan?: number;
    maxOpenDoorTime?: number;
    openDoorTime?: number;
    roomNumber?: number;
    floorNumber?: number;
    userValidBeginTime?: string;
    userValidEndTime?: string;
    userValidTimeType?: number;
    userValidCount?: number;
    userValidTime1?: string;
    userValidTime2?: string;
    userValidTime3?: string;
    userValidTime4?: string;
    userValidTime5?: string;
    userValidTime6?: string;
    userValidTime7?: string;
    userValidTime8?: string;
    userValidTime9?: string;
    userValidTime10?: string;
    userValidTime11?: string;
    userValidTime12?: string;
    userValidTime13?: string;
    userValidTime14?: string;
    userValidTime15?: string;
    userValidTime16?: string;
    userValidTime17?: string;
    userValidTime18?: string;
    userValidTime19?: string;
    userValidTime20?: string;
    userValidTime21?: string;
    userValidTime22?: string;
    userValidTime23?: string;
    userValidTime24?: string;
    userValidTime25?: string;
    userValidTime26?: string;
    userValidTime27?: string;
    userValidTime28?: string;
    userValidTime29?: string;
    userValidTime30?: string;
    userValidTime31?: string;
    userValidTime32?: string;
    userValidTime33?: string;
    userValidTime34?: string;
    userValidTime35?: string;
    userValidTime36?: string;
    userValidTime37?: string;
    userValidTime38?: string;
    userValidTime39?: string;
    userValidTime40?: string;
    userValidTime41?: string;
    userValidTime42?: string;
    userValidTime43?: string;
    userValidTime44?: string;
    userValidTime45?: string;
    userValidTime46?: string;
    userValidTime47?: string;
    userValidTime48?: string;
    userValidTime49?: string;
    userValidTime50?: string;
    userValidTime51?: string;
    userValidTime52?: string;
    userValidTime53?: string;
    userValidTime54?: string;
    userValidTime55?: string;
    userValidTime56?: string;
    userValidTime57?: string;
    userValidTime58?: string;
    userValidTime59?: string;
    userValidTime60?: string;
    userValidTime61?: string;
    userValidTime62?: string;
    userValidTime63?: string;
    userValidTime64?: string;
    userValidTime65?: string;
    userValidTime66?: string;
    userValidTime67?: string;
    userValidTime68?: string;
    userValidTime69?: string;
    userValidTime70?: string;
    userValidTime71?: string;
    userValidTime72?: string;
    userValidTime73?: string;
    userValidTime74?: string;
    userValidTime75?: string;
    userValidTime76?: string;
    userValidTime77?: string;
    userValidTime78?: string;
    userValidTime79?: string;
    userValidTime80?: string;
    userValidTime81?: string;
    userValidTime82?: string;
    userValidTime83?: string;
    userValidTime84?: string;
    userValidTime85?: string;
    userValidTime86?: string;
    userValidTime87?: string;
    userValidTime88?: string;
    userValidTime89?: string;
    userValidTime90?: string;
    userValidTime91?: string;
    userValidTime92?: string;
    userValidTime93?: string;
    userValidTime94?: string;
    userValidTime95?: string;
    userValidTime96?: string;
    userValidTime97?: string;
    userValidTime98?: string;
    userValidTime99?: string;
    userValidTime100?: string;
}
export interface HikvisionResponse {
    statusCode: number;
    statusString: string;
    subStatusCode: string;
    id: string;
    responseStatus: string;
    responseStatusStrg: string;
}
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
    timestamp: string;
}
export interface PaginatedResponse<T> {
    success: boolean;
    message: string;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    timestamp: string;
}
export interface UploadedFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer: Buffer;
}
export interface HikvisionConfig {
    ip: string;
    port: number;
    username: string;
    password: string;
    protocol: string;
    baseUrl: string;
}
export interface ImageProcessingOptions {
    width: number;
    height: number;
    quality: number;
    format: 'jpeg' | 'jpg';
    fit: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}
//# sourceMappingURL=index.d.ts.map