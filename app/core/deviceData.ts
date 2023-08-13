import { result, zip } from 'underscore';
import util from "util";
import { PythonShell, Options } from 'python-shell';

import joid from "../../src/oid.json";
import labels from "../assets/labels";
import deviceArr from "../base_util/deviceArr";
import snmpFunctions from '../utils/snmpFunctions';
import helperFunctions from '../utils/helperFunctions';
import symbols from '../assets/symbols';
import messagesFunctions from '../utils/messagesFunctions';
const currentDate = helperFunctions.getHumanDate(new Date());

type JoidType = {
    [key: string | number]: {
        [key: string]: string;
    };
};

type OidLoaderType = {
    [key: string]: string;
};

 const devicData = {
    getBasicInfo: async (host: string, community: any): Promise<string | false> => {
        let action = devicData.getBasicInfo.name ;
        let message = util.format('{"date":"%s", "action":"%s", ',currentDate,action)
        const result = util.format("%s Устройство не на связи или при выполнении задачи произошла ошибка! Попробуйте позднее", symbols.SHORT)

        try {
            const dirty = await snmpFunctions.getSingleOID(host, joid.basic_oids.oid_model, community)
                .then((res) => res)
                .catch((err) => err);

            const swSysName = await snmpFunctions.getSingleOID(host, joid.basic_oids.oid_sysname, community)
                .then((res) => res);

            const UpTime = await snmpFunctions.getSingleOID(host, joid.basic_oids.oid_uptime, community)
                .then((res) => res);
            const swModel = deviceArr.FilterDeviceModel(dirty);
            const swUpTime = helperFunctions.secToStr(UpTime);

            return util.format(
                "%s\n\n<i>Статус устройства:</i> <code>%s Доступен</code>\n<i>IP устройства: <code>%s</code></i>\n<i>Имя устройства:  <code>%s</code></i>\n<i>Модель устройства:  <code>%s</code></i>\n<i>Uptime:  <code>%s</code>( <code>%s</code>)</i>",
                labels.CheckDeviceLabel,
                symbols.OK_UP,
                host,
                swSysName,
                swModel,
                swUpTime,
                UpTime
            );
        } catch (error) {
            message += util.format('"%s":"%s"}',"error",error)
                    console.error(message);
            // const error = `${error})`
            // console.log(error);
            // logger.info(error);
            return result;
        }

    },
    // getPortStatus1: async (host: string, community: string): Promise<string> => {
    //     console.log(host, community)
    //     const result = util.format(
    //         "%s Устройство не на связи или при выполнении задачи произошла ошибка! Попробуйте позднее",
    //         symbols.SHORT
    //     );

    //     try {
    //         const results: string[] = [];
    //         const dirty = await snmpFunctions.getSingleOID(host, joid.basic_oids.oid_model, community).catch((err) => err);
    //         const model = deviceArr.FilterDeviceModel(dirty)?.toString();
    //         const JSON_aiflist = await deviceArr.ArrayInterfaceModel(model).catch((err) => err);
    //         const aiflist = JSON.parse(JSON_aiflist);
    //         const portIfList = aiflist.interfaceList;
    //         const portIfRange = aiflist.interfaceRange;

    //         const intRange = await snmpFunctions.getMultiOID(host, joid.linux_server.oid_ifName, community).catch((err) => {
    //             console.log(err);
    //             return [];
    //         });

    //         const intList = await snmpFunctions.getMultiOID(host, joid.linux_server.oid_ifIndex, community).catch((err) => {
    //             console.log(err);
    //             return [];
    //         });

    //         for (let ifId in zip(intList, intRange)) {
    //             const intDescr = await snmpFunctions.getSingleOID(
    //                 host,
    //                 joid.linux_server.oid_ifDescr + intList[ifId],
    //                 community
    //             ).catch((err) => {
    //                 console.log(err);
    //                 return "";
    //             });
    //             const portOperStatus = await snmpFunctions.getSingleOID(
    //                 host,
    //                 joid.basic_oids.oid_oper_ports + intList[ifId],
    //                 community
    //             ).catch((err) => {
    //                 console.log(err);
    //                 return "";
    //             });
    //             const portAdminStatus = await snmpFunctions.getSingleOID(
    //                 host,
    //                 joid.basic_oids.oid_admin_ports + intList[ifId],
    //                 community
    //             ).catch((err) => {
    //                 console.log(err);
    //                 return "";
    //             });
    //             const get_inerrors = await snmpFunctions.getSingleOID(
    //                 host,
    //                 joid.basic_oids.oid_inerrors + intList[ifId],
    //                 community
    //             ).catch((err) => {
    //                 console.log(err);
    //                 return "";
    //             });

    //             let operStatus;
    //             if (portOperStatus == "1") {
    //                 operStatus = symbols.OK_UP;
    //             } else if (portOperStatus == "2") {
    //                 operStatus = symbols.SHORT;
    //             } else {
    //                 operStatus = symbols.UNKNOWN;
    //             }

    //             if (portAdminStatus == "2") {
    //                 operStatus = util.format('%s Выключен', symbols.NOCABLE);
    //             }

    //             if (parseInt(get_inerrors) == 0) {
    //                 results.push(util.format("<code>%s</code> %s | %s", intRange[ifId], operStatus, intDescr));
    //             } else if (parseInt(get_inerrors) > 0) {
    //                 results.push(
    //                     util.format(
    //                         "<code>%s</code> %s | %s | <i>Ошибки: %s</i> | %s |",
    //                         intRange[ifId],
    //                         operStatus,
    //                         intDescr,
    //                         get_inerrors,
    //                         symbols.WarnEmo
    //                     )
    //                 );
    //             }
    //         }

    //         return `${results.join('\n')}\n\nP.S. Состояния: ${symbols.OK_UP} - Линк есть, ${symbols.SHORT} - Линка нет, ${symbols.NOCABLE} - Порт выключен, ${symbols.UNKNOWN} - Неизвестно \n`;
    //     } catch (e) {
    //         console.log(e);
    //         return result;
    //     }
    // },
    getPortStatus: async (host: string, community: string): Promise<string> => {
        let action = devicData.getPortStatus.name ;
        let message = util.format('{"date":"%s", "action":"%s", ',currentDate,action)
        const result = util.format("%s Устройство не на связи или при выполнении задачи произошла ошибка! Попробуйте позднее", symbols.SHORT)
        try {
            const results = []
            const dirty = await snmpFunctions.getSingleOID(host, joid.basic_oids.oid_model, community)
                .then((res) => {
                    return res;
                }).catch((error) => {
                    message += util.format('"%s":"%s"}',"error",error)
                    console.error(message);
                    return error;
                });
            const model = deviceArr.FilterDeviceModel(dirty);
            const JSON_aiflist = await deviceArr.ArrayInterfaceModel(model)
                .then((res) => {
                    return res
                })
            const aiflist = JSON.parse(JSON_aiflist)
            const portIfList = aiflist.interfaceList
            const portIfRange = aiflist.interfaceRange
            if (portIfList == "Server" && portIfRange == "Server") {
                // console.log("portIfList: ", portIfList)
                // console.log("portIfRange: ", portIfRange)
                const intRange = await snmpFunctions.getMultiOID(host, joid.linux_server.oid_ifName, community)
                    .then((res) => {
                        return res
                    }, (error) => {
                        message += util.format('"%s":"%s"}',"error",error)
                    console.error(message);
                    });
                const intList = await snmpFunctions.getMultiOID(host, joid.linux_server.oid_ifIndex, community)
                    .then((res) => {
                        return res
                    }, (error) => {
                        message += util.format('"%s":"%s"}',"error",error)
                    console.error(message);
                    });
                // console.log(intRange)
                // console.log(zip(intList, intRange))
                for (let ifId in zip(intList, intRange)) {
                    const intDescr = await snmpFunctions.getSingleOID(host, joid.linux_server.oid_ifDescr + intList[ifId], community)
                        .then((res) => {
                            return res
                        }, (error) => {
                            message += util.format('"%s":"%s"}',"error",error)
                    console.error(message);
                        });
                    const portOperStatus = await snmpFunctions.getSingleOID(host, joid.basic_oids.oid_oper_ports + intList[ifId], community)
                        .then((res) => {
                            return res
                        }, (error) => {
                            message += util.format('"%s":"%s"}',"error",error)
                    console.error(message);
                        });
                    const portAdminStatus = await snmpFunctions.getSingleOID(host, joid.basic_oids.oid_admin_ports + intList[ifId], community)
                        .then((res) => {
                            return res
                        }, (error) => {
                            message += util.format('"%s":"%s"}',"error",error)
                    console.error(message);
                        });
                    const get_inerrors = await snmpFunctions.getSingleOID(host, joid.basic_oids.oid_inerrors + intList[ifId], community)
                        .then((res) => {
                            return res
                        }, (error) => {
                            message += util.format('"%s":"%s"}',"error",error)
                    console.error(message);
                        });
                    // get_inerrors = parseInt(get_inerrors)
                    let operStatus
                    if (portOperStatus == "1") {
                        operStatus = symbols.OK_UP
                    } else if (portOperStatus == "2") {
                        operStatus = symbols.SHORT
                    } else {
                        operStatus = symbols.UNKNOWN
                    }
                    if (portAdminStatus == "2") {
                        operStatus = util.format('%s Выключен', symbols.NOCABLE)
                    }
                    if (parseInt(get_inerrors) == 0) {
                        results.push(util.format("<code>%s</code> %s | %s", intRange[ifId], operStatus, intDescr))
                    } else
                        if (parseInt(get_inerrors) > 0) {
                            results.push(util.format("<code>%s</code> %s | %s | <i>Ошибки: %s</i> | %s |", intRange[ifId], operStatus, intDescr, get_inerrors, symbols.WarnEmo))
                        }
                }
            } else if (portIfList == "auto" && portIfRange == "auto") {
                // console.log("portIfList: ", portIfList)
                // console.log("portIfRange: ", portIfRange)
                const intRange = await snmpFunctions.getMultiOID(host, joid.linux_server.oid_ifName, community)
                    .then((res) => {
                        return res
                    }, (error) => {
                        message += util.format('"%s":"%s"}',"error",error)
                console.error(message);
                    });
                const intList = await snmpFunctions.getMultiOID(host, joid.linux_server.oid_ifIndex, community)
                    .then((res) => {
                        return res
                    }, (error) => {
                        message += util.format('"%s":"%s"}',"error",error)
                console.error(message);
                    });
                // console.log(intRange)
                // console.log(zip(intList, intRange))
                for (let ifId in zip(intList, intRange)) {
                    const intDescr = await snmpFunctions.getSingleOID(host, joid.linux_server.oid_ifDescr + intList[ifId], community)
                        .then((res) => {
                            return res
                        }, (error) => {
                            message += util.format('"%s":"%s"}',"error",error)
                    console.error(message);
                        });
                    const portOperStatus = await snmpFunctions.getSingleOID(host, joid.basic_oids.oid_oper_ports + intList[ifId], community)
                        .then((res) => {
                            return res
                        }, (error) => {
                            message += util.format('"%s":"%s"}',"error",error)
                    console.error(message);
                        });
                    const portAdminStatus = await snmpFunctions.getSingleOID(host, joid.basic_oids.oid_admin_ports + intList[ifId], community)
                        .then((res) => {
                            return res
                        }, (error) => {
                            message += util.format('"%s":"%s"}',"error",error)
                    console.error(message);
                        });
                    const get_inerrors = await snmpFunctions.getSingleOID(host, joid.basic_oids.oid_inerrors + intList[ifId], community)
                        .then((res) => {
                            return res
                        }, (error) => {
                            message += util.format('"%s":"%s"}',"error",error)
                    console.error(message);
                        });
                    // get_inerrors = parseInt(get_inerrors)
                    let operStatus
                    if (portOperStatus == "1") {
                        operStatus = symbols.OK_UP
                    } else if (portOperStatus == "2") {
                        operStatus = symbols.SHORT
                    } else {
                        operStatus = symbols.UNKNOWN
                    }
                    if (portAdminStatus == "2") {
                        operStatus = util.format('%s Выключен', symbols.NOCABLE)
                    }
                    if (parseInt(get_inerrors) == 0) {
                        results.push(util.format("<code>%s</code> %s | %s", intRange[ifId], operStatus, intDescr))
                    } else
                        if (parseInt(get_inerrors) > 0) {
                            results.push(util.format("<code>%s</code> %s | %s | <i>Ошибки: %s</i> | %s |", intRange[ifId], operStatus, intDescr, get_inerrors, symbols.WarnEmo))
                        }
                }
            } else {
                for (let ifId in zip(portIfList, portIfRange)) {
                    const intDescr = await snmpFunctions.getSingleOID(host, joid.basic_oids.oid_descr_ports + portIfList[ifId], community)
                        .then((res) => {
                            return res
                        }, (error) => {
                            message += util.format('"%s":"%s"}',"error",error)
                    console.error(message);
                        });
                    const portOperStatus = await snmpFunctions.getSingleOID(host, joid.basic_oids.oid_oper_ports + portIfList[ifId], community)
                        .then((res) => {
                            return res
                        }, (error) => {
                            message += util.format('"%s":"%s"}',"error",error)
                    console.error(message);
                        });
                    const portAdminStatus = await snmpFunctions.getSingleOID(host, joid.basic_oids.oid_admin_ports + portIfList[ifId], community)
                        .then((res) => {
                            return res
                        }, (error) => {
                            message += util.format('"%s":"%s"}',"error",error)
                    console.error(message);
                        });
                    const get_inerrors = await snmpFunctions.getSingleOID(host, joid.basic_oids.oid_inerrors + portIfList[ifId], community)
                        .then((res) => {
                            return res
                        }, (error) => {
                            message += util.format('"%s":"%s"}',"error",error)
                    console.error(message);
                        });
                    // get_inerrors = parseInt(get_inerrors)
                    let operStatus
                    if (portOperStatus == "1") {
                        operStatus = symbols.OK_UP
                    } else if (portOperStatus == "2") {
                        operStatus = symbols.SHORT
                    } else {
                        operStatus = symbols.UNKNOWN
                    }
                    if (portAdminStatus == "2") {
                        operStatus = util.format('%s Выключен', symbols.NOCABLE)
                    }
                    if (parseInt(get_inerrors) == 0) {
                        results.push(util.format("<code>%s</code> %s | %s", portIfRange[ifId], operStatus, intDescr))
                    } else
                        if (parseInt(get_inerrors) > 0) {
                            results.push(util.format("<code>%s</code> %s | %s | <i>Ошибки: %s</i> | %s |", portIfRange[ifId], operStatus, intDescr, get_inerrors, symbols.WarnEmo))
                        }
                }
            }

            return (`${results.join('\n')}\n\nP.S. Состояния: ${symbols.OK_UP} - Линк есть, ${symbols.SHORT} - Линка нет, ${symbols.NOCABLE} - Порт выключен, ${symbols.UNKNOWN} - Неизвестно \n`)
        } catch (e) {
                message += util.format('"%s":"%s"}',"error",e)
        console.error(message);
            return result

        }
    },
    getVlanList: async (host: string, community: string) => {
        let action = devicData.getVlanList.name ;
        let message = util.format('{"date":"%s", "action":"%s", ',currentDate,action)
        let res: string[] = [];
        const result = util.format("%s Устройство не на связи или при выполнении задачи произошла ошибка! Попробуйте позднее", symbols.SHORT)
        try {
            const vlanName = await snmpFunctions.getMultiOID(host, joid.basic_oids.oid_vlan_list, community)
                .then((res) => {
                    return res;
                }).catch((err) => {
                    message += util.format('"%s":"%s"}',"error",err)
        console.error(message);
                    return err;
                });
            const vlanId = await snmpFunctions.getMultiOID(host, joid.basic_oids.oid_vlan_id, community)
                .then((res) => {
                    return res;
                }).catch((err) => {
                    message += util.format('"%s":"%s"}',"error",err)
        console.error(message);
                    return err;
                });
            if (!vlanName || !vlanId) {
                throw new Error(messagesFunctions.msgSNMPError(host));
            }
            for (let l in vlanName) {
                res.push(`VlanId: ${vlanId[l]} VlanName: ${vlanName[l]} `);
            }
            return res.join('\n');
        } catch (e) {
            message += util.format('"%s":"%s"}',"error",e)
            console.error(message);
            return result;
        }
    },
    getDDMInfo_toFixing: async (host: string, community: string) => {
        let action = devicData.getDDMInfo.name ;
        let message = util.format('{"date":"%s", "action":"%s", ',currentDate,action)
        try {

            const results: string[] = [];
            const dirty = await snmpFunctions.getSingleOID(host, joid.basic_oids.oid_model, community);

            if (!dirty) {
                throw new Error(messagesFunctions.msgSNMPError(host));
            }

            const model: any = deviceArr.FilterDeviceModel(dirty);
            const JSON_aiflist = await deviceArr.ArrayInterfaceModel(model);
            const aiflist = JSON.parse(JSON_aiflist);
            const portIfList = aiflist.interfaceList;
            const portIfRange = aiflist.interfaceRange;
            const ddm = aiflist.ddm;
            const fibers = aiflist.fibers;

            if (ddm && fibers === 0) {
                results.push(`${symbols.WarnEmo} Функция DDM не поддерживается или не реализована`);
                message += util.format('"%s":"%s"}',"error","ddm not supported")
                console.error(message);
            } else {
                const noDDMport = portIfList.length - fibers;
                const DDMport = portIfList.length;

                for (let i = noDDMport; i < DDMport; i++) {
                    const oidLoader = model.includes("SNR") ? "snr_oids" :
                        model.includes("Eltex") ? "eltex_oids" :
                            model.includes("DGS") || model.includes("DES") ? "dlink_oids" :
                                model.includes("SG200-26") ? "cisco_oids" :
                                    "";
                                    console.log(util.format("oidLoader:%s",oidLoader));
                    if (oidLoader === "") {
                        results.push(`${symbols.WarnEmo} Функция DDM не поддерживается или не реализована\n\n`);
                        message += util.format('"%s":"%s"}',"error","ddm not supported")
                        console.error(message);
                        continue;
                    }

                    const oidSuffix = model.includes("SNR") ? `DDMRXPower${portIfList[i]}` :
                        model.includes("Eltex MES14") || model.includes("Eltex MES24") || model.includes("Eltex MES3708") ?
                            `DDM_mes14_mes24_mes_3708${portIfList[i]}` :
                            model.includes("Eltex MES23") || model.includes("Eltex MES33") || model.includes("Eltex MES35") || model.includes("Eltex MES53") ?
                                `DDM_mes23_mes33_mes35_mes53${portIfList[i]}` :
                                model.includes("DGS-3620") || model.includes("DES-3200") || model.includes("DGS-3000") ?
                                    `dgs36xx_ses32xx_dgs_30xx_ddm_rx_power${portIfList[i]}` :
                                    model.includes("SG200-26") ? `cisco_DDM_S200${portIfList[i]}` : "";
                                    console.log(util.format("oidSuffix:%s",oidSuffix));
                    if (oidSuffix === "") {
                        results.push(`${symbols.WarnEmo} Функция DDM не поддерживается или не реализована\n\n`);
                        message += util.format('"%s":"%s"}',"error","ddm not supported")
                        console.error(message);
                        continue;
                    }
                    console.log(`${joid}.${oidLoader}.${oidSuffix}` + '.6')
                    const getDDMLevelRX = await snmpFunctions.getSingleOID(host, `${joid}.${oidLoader}.${oidSuffix}` + '.9', community);
                    const getDDMLevelTX = await snmpFunctions.getSingleOID(host, `${joid}.${oidLoader}.${oidSuffix}` + '.8', community);
                    const getDDMTemperature = await snmpFunctions.getSingleOID(host, `${joid}.${oidLoader}.${oidSuffix}` + '.5', community);
                    const getDDMVoltage = await snmpFunctions.getSingleOID(host, `${joid}.${oidLoader}.${oidSuffix}` + '.6', community);
                    console.log(`${joid}.${oidLoader}.${oidSuffix}` + '.6')

                    if (getDDMLevelTX !== "noSuchInstance" && getDDMLevelRX !== "noSuchInstance") {
                        let DDMLevelRX = getDDMLevelRX.toString();
                        let DDMLevelTX = getDDMLevelTX.toString();
                        let DDMVoltage = parseFloat((getDDMVoltage / 1000000).toFixed(3));

                        if (DDMLevelRX.length === 3) {
                            DDMLevelRX = '0,' + DDMLevelRX;
                        } else if (DDMLevelRX.length === 5) {
                            DDMLevelRX = DDMLevelRX.slice(0, 2) + ',' + DDMLevelRX.slice(3);
                        } else if (DDMLevelRX.length === 6) {
                            DDMLevelRX = DDMLevelRX.slice(0, 3) + ',' + DDMLevelRX.slice(4);
                        }

                        if (DDMLevelTX.length === 3) {
                            DDMLevelTX = '0,' + DDMLevelTX;
                        } else if (DDMLevelTX.length === 5) {
                            DDMLevelTX = DDMLevelTX.slice(0, 2) + ',' + DDMLevelTX.slice(3);
                        } else if (DDMLevelTX.length === 6) {
                            DDMLevelTX = DDMLevelTX.slice(0, 3) + ',' + DDMLevelTX.slice(4);
                        }

                        results.push(`${portIfRange[i]} 🔺TX: ${DDMLevelTX} 🔻RX: ${DDMLevelRX} 🌡C:${getDDMTemperature} ⚡️V: ${DDMVoltage}`);
                    }
                }
            }

            return results.join('\n');
        } catch (e) {
            message += util.format('"%s":"%s"}',"error",e)
        console.error(message);
            return util.format(
                "%s Устройство не на связи или при выполнении задачи произошла ошибка! Попробуйте позднее",
                symbols.SHORT
            );
        }
    },
    getDDMInfo: async (host: string, community: string) => {
        const action = devicData.getDDMInfo.name;
        let message = `{"date":"${currentDate}", "action":"${action}", `;
        try {
            const results: string[] = [];
            const dirty = await snmpFunctions.getSingleOID(host, joid.basic_oids.oid_model, community);
    
            if (!dirty) {
                throw new Error(messagesFunctions.msgSNMPError(host));
            }
    
            const model: any = deviceArr.FilterDeviceModel(dirty);
            const JSON_aiflist = await deviceArr.ArrayInterfaceModel(model);
            const aiflist = JSON.parse(JSON_aiflist);
            const portIfList = aiflist.interfaceList;
            const portIfRange = aiflist.interfaceRange;
            const ddm = aiflist.ddm;
            const fibers = aiflist.fibers;
    
            if (ddm && fibers === 0) {
                results.push(`${symbols.WarnEmo} Функция DDM не поддерживается или не реализована`);
                message += `"error":"ddm not supported"}`;
                console.error(message);
            } else {
                const noDDMport = portIfList.length - fibers;
                const DDMport = portIfList.length;
    
                for (let i = noDDMport; i < DDMport; i++) {
                    const oidLoaderKey = model.includes("SNR") ? "snr_oids" :
                        model.includes("Eltex") ? "eltex_oids" :
                        model.includes("DGS") || model.includes("DES") ? "dlink_oids" :
                        model.includes("SG200-26") ? "cisco_oids" : "";
                    console.log(`oidLoader:${oidLoaderKey}`);
                    if (oidLoaderKey === "") {
                        results.push(`${symbols.WarnEmo} Функция DDM не поддерживается или не реализована\n\n`);
                        message += `"error":"ddm not supported"}`;
                        console.error(message);
                        continue;
                    }
                    const oidLoader: OidLoaderType = joid[oidLoaderKey];

    
                    const oidSuffix = model.includes("SNR") ? `DDMRXPower${portIfList[i]}` :
                        model.includes("Eltex MES14") || model.includes("Eltex MES24") || model.includes("Eltex MES3708") ?
                            `DDM_mes14_mes24_mes_3708${portIfList[i]}` :
                            model.includes("Eltex MES23") || model.includes("Eltex MES33") || model.includes("Eltex MES35") || model.includes("Eltex MES53") ?
                                `DDM_mes23_mes33_mes35_mes53${portIfList[i]}` :
                                model.includes("DGS-3620") || model.includes("DES-3200") || model.includes("DGS-3000") ?
                                    `dgs36xx_ses32xx_dgs_30xx_ddm_rx_power${portIfList[i]}` :
                                    model.includes("SG200-26") ? `cisco_DDM_S200${portIfList[i]}` : "";
                                    console.log(util.format("oidSuffix:%s",oidSuffix));
                    if (!oidLoader.hasOwnProperty(oidSuffix)) {
                        results.push(`${symbols.WarnEmo} Функция DDM не поддерживается или не реализована\n\n`);
                        message += `"error":"ddm not supported"}`;
                        console.error(message);
                        continue;
                    }
                    // const oidLoaderKey = oidLoader as keyof JoidType;
                    // const oidSuffixKey = oidSuffix as keyof JoidType[typeof oidLoaderKey];
                    // const oidValue = joid[oidLoaderKey][oidSuffixKey];
                    const oidValue = oidLoader[oidSuffix];

                    // const oidDDMString  = `${joid[oidLoader][oidSuffix]}`;
                    console.log(`${oidValue}.6`);
                    const getDDMLevelRX = await snmpFunctions.getSingleOID(host, `${oidValue}.9`, community);
                    const getDDMLevelTX = await snmpFunctions.getSingleOID(host, `${oidValue}.8`, community);
                    const getDDMTemperature = await snmpFunctions.getSingleOID(host, `${oidValue}.5`, community);
                    const getDDMVoltage = await snmpFunctions.getSingleOID(host, `${oidValue}.6`, community);                    
                    console.log(`${oidValue}.6`);
    
                    if (getDDMLevelTX !== "noSuchInstance" && getDDMLevelRX !== "noSuchInstance") {
                        let DDMLevelRX = getDDMLevelRX.toString();
                        let DDMLevelTX = getDDMLevelTX.toString();
                        let DDMVoltage = parseFloat((getDDMVoltage / 1000000).toFixed(3));
    
                        if (DDMLevelRX.length === 3) {
                            DDMLevelRX = '0,' + DDMLevelRX;
                        } else if (DDMLevelRX.length === 5) {
                            DDMLevelRX = DDMLevelRX.slice(0, 2) + ',' + DDMLevelRX.slice(3);
                        } else if (DDMLevelRX.length === 6) {
                            DDMLevelRX = DDMLevelRX.slice(0, 3) + ',' + DDMLevelRX.slice(4);
                        }
    
                        if (DDMLevelTX.length === 3) {
                            DDMLevelTX = '0,' + DDMLevelTX;
                        } else if (DDMLevelTX.length === 5) {
                            DDMLevelTX = DDMLevelTX.slice(0, 2) + ',' + DDMLevelTX.slice(3);
                        } else if (DDMLevelTX.length === 6) {
                            DDMLevelTX = DDMLevelTX.slice(0, 3) + ',' + DDMLevelTX.slice(4);
                        }
    
                        results.push(`${portIfRange[i]} 🔺TX: ${DDMLevelTX} 🔻RX: ${DDMLevelRX} 🌡C:${getDDMTemperature} ⚡️V: ${DDMVoltage}`);
                    }
                }
            }
    
            return results.join('\n');
        } catch (error) {
            message += `"error":"${error}"}`;
            console.error(message);
            return `${symbols.SHORT} Устройство не на связи или при выполнении задачи произошла ошибка! Попробуйте позднее`;
        }
    },    

    runNetmikoScript: (): Promise<string> => {
        const options: Options = {
            mode: 'json',
            pythonOptions: ['-u'], // unbuffered output
            scriptPath: '/', // путь к файлу netmiko_script.py
        };

        return new Promise((resolve, reject) => {
            PythonShell.runString('ps.py', options).then(messages => {
                console.log(messages);
            });
        })
    }
}

export default devicData;