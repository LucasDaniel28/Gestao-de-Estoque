"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HikvisionClient = void 0;
var axios_1 = require("axios");
var digest_fetch_1 = require("digest-fetch");
var form_data_1 = require("form-data");
var sharp_1 = require("sharp");
var fs_1 = require("fs");
var xml2js_1 = require("xml2js");
/**
 * Cliente para comunicação com dispositivo Hikvision DS-K1T342MFWX via ISAPI
 * Implementa autenticação HTTP Digest e endpoints para gerenciamento de usuários e faces
 */
var HikvisionClient = /** @class */ (function () {
    function HikvisionClient(config) {
        this.config = config;
        this.client = new digest_fetch_1.default(config.username, config.password, { algorithm: 'MD5' });
    }
    HikvisionClient.prototype.getUrl = function (path) {
        if (path.startsWith('http'))
            return path;
        return "".concat(this.config.baseUrl).concat(path);
    };
    /**
     * Processa imagem para o formato aceito pelo dispositivo Hikvision
     * Redimensiona para 640x480, converte para JPEG e otimiza qualidade
     */
    HikvisionClient.prototype.processImage = function (imageBuffer) {
        return __awaiter(this, void 0, void 0, function () {
            var processedImage, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, sharp_1.default)(imageBuffer)
                                .resize(640, 480, { fit: 'cover' })
                                .jpeg({ quality: 85 })
                                .toBuffer()];
                    case 1:
                        processedImage = _a.sent();
                        return [2 /*return*/, processedImage];
                    case 2:
                        error_1 = _a.sent();
                        throw new Error("Erro ao processar imagem: ".concat(error_1));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Converte objeto Patient para formato HikvisionUser
     */
    HikvisionClient.prototype.patientToHikvisionUser = function (patient) {
        return {
            employeeNo: patient.employeeNo,
            name: patient.name,
            userType: 0,
            userNo: "",
            userStatus: 0,
            gender: 1,
            password: "",
            localRight: 1,
            doorRight: 1,
            rightPlan: [
                {
                    doorNo: 1,
                    planTemplateNo: "1"
                }
            ],
            userVerifyMode: 2,
            userValidBeginTime: new Date().toISOString().split('T')[0],
            userValidEndTime: '2099-12-31',
            userValidTimeType: 0,
            userValidCount: 0,
            maxOpenDoorTime: 0,
            openDoorTime: 0,
            roomNumber: "1",
            floorNumber: "1"
        };
    };
    // Função utilitária para parser híbrido JSON/XML
    HikvisionClient.prototype.parseHikvisionResponse = function (response) {
        return __awaiter(this, void 0, void 0, function () {
            var contentType, data, _a, _b, jsonData, xmlData, e_1;
            var _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        contentType = ((_d = (_c = response.headers) === null || _c === void 0 ? void 0 : _c.get) === null || _d === void 0 ? void 0 : _d.call(_c, 'content-type')) || ((_e = response.headers) === null || _e === void 0 ? void 0 : _e['content-type']) || '';
                        _a = response.data;
                        if (_a) return [3 /*break*/, 4];
                        if (!(typeof response.text === 'function')) return [3 /*break*/, 2];
                        return [4 /*yield*/, response.text()];
                    case 1:
                        _b = _f.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _b = response.body;
                        _f.label = 3;
                    case 3:
                        _a = (_b);
                        _f.label = 4;
                    case 4:
                        data = _a;
                        // Se já é objeto, retorna direto
                        if (typeof data === 'object') {
                            return [2 /*return*/, { success: true, data: data, format: 'json' }];
                        }
                        // Tenta JSON primeiro
                        if (contentType.includes('json') || (typeof data === 'string' && data.trim().startsWith('{'))) {
                            try {
                                jsonData = typeof data === 'string' ? JSON.parse(data) : data;
                                return [2 /*return*/, { success: true, data: jsonData, format: 'json' }];
                            }
                            catch (e) { }
                        }
                        if (!(contentType.includes('xml') || (typeof data === 'string' && data.trim().startsWith('<')))) return [3 /*break*/, 8];
                        _f.label = 5;
                    case 5:
                        _f.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, xml2js_1.default.parseStringPromise(data)];
                    case 6:
                        xmlData = _f.sent();
                        return [2 /*return*/, { success: true, data: xmlData, format: 'xml' }];
                    case 7:
                        e_1 = _f.sent();
                        console.log('Falha no parsing XML:', e_1.message);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/, { success: false, error: 'Formato não reconhecido' }];
                }
            });
        });
    };
    // Função utilitária para extrair dados de XML
    HikvisionClient.prototype.extractXmlData = function (xmlString, tagName) {
        if (!xmlString || typeof xmlString !== 'string')
            return null;
        var regex = new RegExp("<".concat(tagName, ">([sS]*?)</").concat(tagName, ">"), 'i');
        var match = xmlString.match(regex);
        return match && match[1] ? match[1].trim() : null;
    };
    /**
     * Lista todos os usuários cadastrados no dispositivo
     * Endpoint: GET /ISAPI/AccessControl/UserInfo/Search
     */
    HikvisionClient.prototype.listUsers = function () {
        return __awaiter(this, void 0, void 0, function () {
            var searchXml, url, response, parsed, users, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        searchXml = "\n        <UserInfoSearchCond version=\"2.0\" xmlns=\"http://www.hikvision.com/ver20/XMLSchema\">\n          <searchID>1</searchID>\n          <searchResultPosition>0</searchResultPosition>\n          <maxResults>1000</maxResults>\n        </UserInfoSearchCond>\n      ";
                        url = this.getUrl('/ISAPI/AccessControl/UserInfo/Search');
                        return [4 /*yield*/, this.client.fetch(url, {
                                method: 'POST',
                                body: searchXml,
                                headers: { 'Content-Type': 'application/xml' }
                            })];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, this.parseHikvisionResponse(response)];
                    case 2:
                        parsed = _a.sent();
                        if (parsed.success) {
                            users = parsed.data.UserInfoSearchResult.UserInfo;
                            return [2 /*return*/, users.map(function (user) { return ({
                                    employeeNo: user.employeeNo || '',
                                    name: user.name || '',
                                    faceId: user.faceId || '',
                                    cardNo: user.cardNo || '',
                                    userType: parseInt(user.userType) || 0,
                                    localRight: parseInt(user.localRight) || 0,
                                    userVerifyMode: parseInt(user.userVerifyMode) || 0,
                                    rightPlan: parseInt(user.rightPlan) || 0,
                                    maxOpenDoorTime: parseInt(user.maxOpenDoorTime) || 0,
                                    openDoorTime: parseInt(user.openDoorTime) || 0,
                                    roomNumber: parseInt(user.roomNumber) || 0,
                                    floorNumber: parseInt(user.floorNumber) || 0,
                                    userValidBeginTime: user.userValidBeginTime || '',
                                    userValidEndTime: user.userValidEndTime || '',
                                    userValidTimeType: parseInt(user.userValidTimeType) || 0,
                                    userValidCount: parseInt(user.userValidCount) || 0
                                }); })];
                        }
                        return [2 /*return*/, []];
                    case 3:
                        error_2 = _a.sent();
                        console.error('Erro ao listar usuários:', error_2);
                        throw new Error("Falha ao listar usu\u00E1rios: ".concat(error_2));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Cadastra um novo usuário no dispositivo
     * Endpoint: POST /ISAPI/AccessControl/UserInfo/Record
     */
    HikvisionClient.prototype.createUser = function (patient) {
        return __awaiter(this, void 0, void 0, function () {
            var hikvisionUser, beginTime, endTime, userData, url, response, parsed, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        hikvisionUser = this.patientToHikvisionUser(patient);
                        beginTime = hikvisionUser.userValidBeginTime + "T00:00:00";
                        endTime = "2037-12-31T23:59:59";
                        userData = {
                            UserInfo: {
                                employeeNo: hikvisionUser.employeeNo,
                                name: hikvisionUser.name,
                                userType: "normal",
                                Valid: {
                                    enable: true,
                                    beginTime: beginTime,
                                    endTime: endTime,
                                    timeType: "local"
                                },
                                password: "",
                                doorRight: "1",
                                RightPlan: [
                                    {
                                        doorNo: 1,
                                        planTemplateNo: "1"
                                    }
                                ],
                                gender: "unknown"
                            }
                        };
                        console.log('JSON enviado ao Hikvision:');
                        console.log(JSON.stringify(userData, null, 2));
                        url = "".concat(this.config.baseUrl, "/ISAPI/AccessControl/UserInfo/Record?format=json");
                        return [4 /*yield*/, this.client.fetch(url, {
                                method: 'POST',
                                body: JSON.stringify(userData),
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json'
                                }
                            })];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, this.parseHikvisionResponse(response)];
                    case 2:
                        parsed = _a.sent();
                        if (parsed.success) {
                            return [2 /*return*/, { statusCode: 1, statusString: 'OK' }];
                        }
                        else {
                            return [2 /*return*/, { statusCode: 4, statusString: 'Erro', errorMsg: parsed.error }];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        console.error('Erro ao criar usuário no Hikvision:', error_3);
                        throw error_3;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Atualiza dados de um usuário existente
     * Endpoint: PUT /ISAPI/AccessControl/UserInfo/Modify
     */
    HikvisionClient.prototype.updateUser = function (employeeNo, patient) {
        return __awaiter(this, void 0, void 0, function () {
            var hikvisionUser, userData, url, response, parsed, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        hikvisionUser = this.patientToHikvisionUser(patient);
                        userData = {
                            UserInfo: {
                                version: '2.0',
                                xmlns: 'http://www.hikvision.com/ver20/XMLSchema',
                                employeeNo: employeeNo,
                                name: hikvisionUser.name,
                                userType: hikvisionUser.userType,
                                localRight: hikvisionUser.localRight,
                                userVerifyMode: hikvisionUser.userVerifyMode,
                                rightPlan: hikvisionUser.rightPlan,
                                maxOpenDoorTime: hikvisionUser.maxOpenDoorTime,
                                openDoorTime: hikvisionUser.openDoorTime,
                                roomNumber: hikvisionUser.roomNumber,
                                floorNumber: hikvisionUser.floorNumber,
                                userValidBeginTime: hikvisionUser.userValidBeginTime,
                                userValidEndTime: hikvisionUser.userValidEndTime,
                                userValidTimeType: hikvisionUser.userValidTimeType,
                                userValidCount: hikvisionUser.userValidCount
                            }
                        };
                        console.log('JSON enviado ao Hikvision:');
                        console.log(JSON.stringify(userData, null, 2));
                        url = this.getUrl("/ISAPI/AccessControl/UserInfo/Modify?employeeNo=".concat(employeeNo));
                        return [4 /*yield*/, this.client.fetch(url, {
                                method: 'PUT',
                                body: JSON.stringify(userData),
                                headers: { 'Content-Type': 'application/json' }
                            })];
                    case 1:
                        response = _a.sent();
                        console.log('Resposta do Hikvision:');
                        console.log(JSON.stringify(response.data, null, 2));
                        return [4 /*yield*/, this.parseHikvisionResponse(response)];
                    case 2:
                        parsed = _a.sent();
                        if (parsed.success) {
                            return [2 /*return*/, { statusCode: 1, statusString: 'OK' }];
                        }
                        else {
                            return [2 /*return*/, { statusCode: 4, statusString: 'Erro', errorMsg: parsed.error }];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _a.sent();
                        console.error('Erro ao atualizar usuário:', error_4);
                        throw new Error("Falha ao atualizar usu\u00E1rio: ".concat(error_4));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Remove um usuário do dispositivo
     * Endpoint: DELETE /ISAPI/AccessControl/UserInfo/Delete
     */
    HikvisionClient.prototype.deleteUser = function (employeeNo) {
        return __awaiter(this, void 0, void 0, function () {
            var url, response, parsed, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        url = this.getUrl("/ISAPI/AccessControl/UserInfo/Delete?employeeNo=".concat(employeeNo));
                        return [4 /*yield*/, this.client.fetch(url, { method: 'DELETE' })];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, this.parseHikvisionResponse(response)];
                    case 2:
                        parsed = _a.sent();
                        if (parsed.success) {
                            return [2 /*return*/, { statusCode: 1, statusString: 'OK' }];
                        }
                        else {
                            return [2 /*return*/, { statusCode: 4, statusString: 'Erro', errorMsg: parsed.error }];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        console.error('Erro ao deletar usuário:', error_5);
                        throw new Error("Falha ao deletar usu\u00E1rio: ".concat(error_5));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Upload de foto facial para o dispositivo (padrão IVMS)
     * Endpoint: POST /ISAPI/Intelligent/FDLib/FaceDataRecord?format=json
     */
    HikvisionClient.prototype.uploadFaceDataRecord = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var imageBuffer, processedImage, form, url, response;
            var employeeNo = _b.employeeNo, imagePath = _b.imagePath, _c = _b.FDID, FDID = _c === void 0 ? '1' : _c, _d = _b.faceLibType, faceLibType = _d === void 0 ? 'blackFD' : _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        imageBuffer = fs_1.default.readFileSync(imagePath);
                        return [4 /*yield*/, this.processImage(imageBuffer)];
                    case 1:
                        processedImage = _e.sent();
                        form = new form_data_1.default();
                        form.append('faceLibType', faceLibType);
                        form.append('FDID', FDID);
                        form.append('FPID', employeeNo);
                        form.append('faceImage', processedImage, {
                            filename: "".concat(employeeNo, ".jpg"),
                            contentType: 'image/jpeg'
                        });
                        url = this.getUrl('/ISAPI/Intelligent/FDLib/FaceDataRecord?format=json');
                        return [4 /*yield*/, axios_1.default.post(url, form, {
                                headers: __assign(__assign({}, form.getHeaders()), { 'Authorization': 'Basic ' + Buffer.from("".concat(this.config.username, ":").concat(this.config.password)).toString('base64') }),
                                timeout: 20000,
                                validateStatus: function () { return true; }
                            })];
                    case 2:
                        response = _e.sent();
                        return [2 /*return*/, response.data];
                }
            });
        });
    };
    /**
     * Remove a foto de rosto de um usuário
     * Endpoint: DELETE /ISAPI/Intelligent/FDLib/FaceDataRecord?format=json
     */
    HikvisionClient.prototype.deleteFace = function (faceId_1) {
        return __awaiter(this, arguments, void 0, function (faceId, FDID) {
            var url, body, response, parsed, error_6;
            if (FDID === void 0) { FDID = '1'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        url = this.getUrl('/ISAPI/Intelligent/FDLib/FaceDataRecord?format=json');
                        body = {
                            FaceDataRecordList: [{
                                    FDID: FDID,
                                    faceID: faceId
                                }]
                        };
                        return [4 /*yield*/, this.client.fetch(url, {
                                method: 'DELETE',
                                body: JSON.stringify(body),
                                headers: { 'Content-Type': 'application/json' }
                            })];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, this.parseHikvisionResponse(response)];
                    case 2:
                        parsed = _a.sent();
                        if (parsed.success) {
                            return [2 /*return*/, { statusCode: 1, statusString: 'OK' }];
                        }
                        else {
                            return [2 /*return*/, { statusCode: 4, statusString: 'Erro', errorMsg: parsed.error }];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_6 = _a.sent();
                        console.error('Erro ao deletar face:', error_6);
                        throw new Error("Falha ao deletar face: ".concat(error_6));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Verifica se o dispositivo está online e acessível
     * Endpoint: GET /ISAPI/System/deviceInfo
     */
    HikvisionClient.prototype.checkDeviceStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            var url, response, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        url = this.getUrl('/ISAPI/System/deviceInfo');
                        return [4 /*yield*/, this.client.fetch(url, { method: 'GET' })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.status === 200];
                    case 2:
                        error_7 = _a.sent();
                        console.error('Dispositivo não está acessível:', error_7);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Obtém informações do dispositivo
     * Endpoint: GET /ISAPI/System/deviceInfo
     */
    HikvisionClient.prototype.getDeviceInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var url, response, parsed, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        url = this.getUrl('/ISAPI/System/deviceInfo');
                        return [4 /*yield*/, this.client.fetch(url, { method: 'GET' })];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, this.parseHikvisionResponse(response)];
                    case 2:
                        parsed = _a.sent();
                        if (parsed.success) {
                            return [2 /*return*/, parsed.data];
                        }
                        else {
                            throw new Error(parsed.error || 'Erro ao obter informações do dispositivo');
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_8 = _a.sent();
                        console.error('Erro ao obter informações do dispositivo:', error_8);
                        throw new Error("Falha ao obter informa\u00E7\u00F5es do dispositivo: ".concat(error_8));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Lista todas as bibliotecas faciais (FDLib) do dispositivo
     * Endpoint: GET /ISAPI/Intelligent/FDLib
     */
    HikvisionClient.prototype.listFaceLibraries = function () {
        return __awaiter(this, void 0, void 0, function () {
            var url, response, parsed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = this.getUrl('/ISAPI/Intelligent/FDLib');
                        return [4 /*yield*/, this.client.fetch(url, { method: 'GET', headers: { 'Accept': 'application/xml' } })];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, this.parseHikvisionResponse(response)];
                    case 2:
                        parsed = _a.sent();
                        if (parsed.success && parsed.data && parsed.data.FDLibList && parsed.data.FDLibList.FDLib) {
                            return [2 /*return*/, parsed.data.FDLibList.FDLib];
                        }
                        return [2 /*return*/, []];
                }
            });
        });
    };
    /**
     * Upload de foto facial para o dispositivo (padrão ISAPI)
     * Busca o FDID real da biblioteca antes de enviar
     */
    HikvisionClient.prototype.uploadFacePictureLibrary = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var realFDID, libs, imageBuffer, processedImage, faceAppendData, xml, form, url, headers, body, response, parsed;
            var _c, _d;
            var name = _b.name, customHumanID = _b.customHumanID, imagePath = _b.imagePath, FDID = _b.FDID, _e = _b.sex, sex = _e === void 0 ? 'unknown' : _e, _f = _b.bornTime, bornTime = _f === void 0 ? '' : _f, _g = _b.certificateType, certificateType = _g === void 0 ? '' : _g, _h = _b.certificateNumber, certificateNumber = _h === void 0 ? '' : _h, _j = _b.phoneNumber, phoneNumber = _j === void 0 ? '' : _j;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        realFDID = FDID;
                        if (!!realFDID) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.listFaceLibraries()];
                    case 1:
                        libs = _k.sent();
                        if (!libs.length) {
                            return [2 /*return*/, { statusCode: 4, statusString: 'Erro', errorMsg: 'Nenhuma biblioteca facial encontrada no dispositivo.' }];
                        }
                        // Pega o primeiro FDID disponível
                        realFDID = ((_c = libs[0].id) === null || _c === void 0 ? void 0 : _c[0]) || ((_d = libs[0].FDID) === null || _d === void 0 ? void 0 : _d[0]) || '1';
                        _k.label = 2;
                    case 2:
                        imageBuffer = fs_1.default.readFileSync(imagePath);
                        return [4 /*yield*/, this.processImage(imageBuffer)];
                    case 3:
                        processedImage = _k.sent();
                        faceAppendData = "\n      <name>".concat(name, "</name>\n      <sex>").concat(sex, "</sex>\n      ").concat(bornTime ? "<bornTime>".concat(bornTime, "</bornTime>") : '', "\n      ").concat(certificateType ? "<certificateType>".concat(certificateType, "</certificateType>") : '', "\n      ").concat(certificateNumber ? "<certificateNumber>".concat(certificateNumber, "</certificateNumber>") : '', "\n      ").concat(phoneNumber ? "<phoneNumber>".concat(phoneNumber, "</phoneNumber>") : '', "\n      <customHumanID>").concat(customHumanID, "</customHumanID>\n    ");
                        xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n      <PictureUploadData version=\"2.0\" xmlns=\"http://www.isapi.org/ver20/XMLSchema\">\n        <FDID>".concat(realFDID, "</FDID>\n        <FaceAppendData>\n          ").concat(faceAppendData.trim(), "\n        </FaceAppendData>\n      </PictureUploadData>");
                        form = new form_data_1.default();
                        form.append('PictureUploadData', xml, { contentType: 'application/xml' });
                        form.append('face_picture', processedImage, {
                            filename: "".concat(customHumanID, ".jpg"),
                            contentType: 'image/jpeg'
                        });
                        url = this.getUrl('/ISAPI/Intelligent/FDLib/pictureUpload');
                        headers = form.getHeaders();
                        body = form.getBuffer();
                        return [4 /*yield*/, this.client.fetch(url, {
                                method: 'POST',
                                headers: headers,
                                body: body
                            })];
                    case 4:
                        response = _k.sent();
                        return [4 /*yield*/, this.parseHikvisionResponse(response)];
                    case 5:
                        parsed = _k.sent();
                        if (parsed.success) {
                            return [2 /*return*/, {
                                    statusCode: 1,
                                    statusString: 'OK',
                                    rawResponse: parsed.data ? JSON.stringify(parsed.data) : ''
                                }];
                        }
                        else {
                            return [2 /*return*/, {
                                    statusCode: 4,
                                    statusString: 'Erro',
                                    errorMsg: parsed.error || 'Erro desconhecido',
                                    rawResponse: parsed.data ? JSON.stringify(parsed.data) : ''
                                }];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Cria uma biblioteca facial (FDLib) no dispositivo
     * Endpoint: POST /ISAPI/Intelligent/FDLib
     */
    HikvisionClient.prototype.createFaceLibrary = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var xml, url, response, parsed;
            var id = _b.id, name = _b.name, _c = _b.maxCapacity, maxCapacity = _c === void 0 ? 1000 : _c, _d = _b.faceThreshold, faceThreshold = _d === void 0 ? 80 : _d, _e = _b.customInfo, customInfo = _e === void 0 ? '' : _e, _f = _b.customFaceLibID, customFaceLibID = _f === void 0 ? '' : _f, _g = _b.autoUpdata, autoUpdata = _g === void 0 ? true : _g, _h = _b.qualityThreshold, qualityThreshold = _h === void 0 ? 50 : _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<CreateFDLibList xmlns=\"http://www.isapi.org/ver20/XMLSchema\" version=\"2.0\">\n  <CreateFDLib>\n    <id>".concat(id, "</id>\n    <name>").concat(name, "</name>\n    <maxCapacity>").concat(maxCapacity, "</maxCapacity>\n    <thresholdValue>").concat(faceThreshold, "</thresholdValue>\n    <customInfo>").concat(customInfo, "</customInfo>\n    <customFaceLibID>").concat(customFaceLibID, "</customFaceLibID>\n    <autoUpdata>").concat(autoUpdata, "</autoUpdata>\n    <qualityThreshold>").concat(qualityThreshold, "</qualityThreshold>\n  </CreateFDLib>\n</CreateFDLibList>");
                        url = this.getUrl('/ISAPI/Intelligent/FDLib');
                        return [4 /*yield*/, this.client.fetch(url, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/xml' },
                                body: xml
                            })];
                    case 1:
                        response = _j.sent();
                        return [4 /*yield*/, this.parseHikvisionResponse(response)];
                    case 2:
                        parsed = _j.sent();
                        if (parsed.success) {
                            return [2 /*return*/, {
                                    statusCode: 1,
                                    statusString: 'OK',
                                    rawResponse: parsed.data ? JSON.stringify(parsed.data) : ''
                                }];
                        }
                        else {
                            return [2 /*return*/, {
                                    statusCode: 4,
                                    statusString: 'Erro',
                                    errorMsg: parsed.error || 'Erro desconhecido',
                                    rawResponse: parsed.data ? JSON.stringify(parsed.data) : ''
                                }];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Upload facial via FaceDataRecord ISAPI padrão (XML)
     * Endpoint: POST /ISAPI/Intelligent/FDLib/FaceDataRecord
     * Body: form-data com FaceDataRecord (XML) e FaceImage (File)
     */
    HikvisionClient.prototype.uploadFaceDataRecordXml = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var xml, form, imageBuffer, url, headers, response, parsed, error_9;
            var _c = _b.FDID, FDID = _c === void 0 ? '1' : _c, FPID = _b.FPID, imagePath = _b.imagePath, _d = _b.faceLibType, faceLibType = _d === void 0 ? 'blackFD' : _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 3, , 4]);
                        xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<FaceDataRecord version=\"2.0\" xmlns=\"http://www.isapi.org/ver20/XMLSchema\">\n  <FDID>".concat(FDID, "</FDID>\n  <FPID>").concat(FPID, "</FPID>\n  <faceLibType>").concat(faceLibType, "</faceLibType>\n</FaceDataRecord>");
                        form = new form_data_1.default();
                        form.append('FaceDataRecord', xml, { contentType: 'application/xml' });
                        imageBuffer = fs_1.default.readFileSync(imagePath);
                        form.append('FaceImage', imageBuffer, {
                            filename: "".concat(FPID, ".jpg"),
                            contentType: 'image/jpeg'
                        });
                        url = this.getUrl('/ISAPI/Intelligent/FDLib/FaceDataRecord');
                        headers = form.getHeaders();
                        return [4 /*yield*/, this.client.fetch(url, {
                                method: 'POST',
                                headers: headers,
                                body: form.getBuffer()
                            })];
                    case 1:
                        response = _e.sent();
                        return [4 /*yield*/, this.parseHikvisionResponse(response)];
                    case 2:
                        parsed = _e.sent();
                        if (parsed.success) {
                            return [2 /*return*/, {
                                    statusCode: 1,
                                    statusString: 'OK',
                                    rawResponse: parsed.data ? JSON.stringify(parsed.data) : ''
                                }];
                        }
                        else {
                            return [2 /*return*/, {
                                    statusCode: 4,
                                    statusString: 'Erro',
                                    errorMsg: parsed.error || 'Erro desconhecido',
                                    rawResponse: parsed.data ? JSON.stringify(parsed.data) : ''
                                }];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_9 = _e.sent();
                        return [2 /*return*/, {
                                statusCode: 4,
                                statusString: 'Erro',
                                errorMsg: error_9 instanceof Error ? error_9.message : 'Erro desconhecido',
                                rawResponse: ''
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    HikvisionClient.prototype.getClient = function () {
        return this.client;
    };
    return HikvisionClient;
}());
exports.HikvisionClient = HikvisionClient;
