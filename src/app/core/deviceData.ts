import { Options, PythonShell } from "python-shell";
import { zip } from "underscore";
import util from "util";
import * as path from "path";
import joid from "../../src/oid.json";
import labels from "../assets/labels";
import symbols from "../assets/symbols";
import deviceArr from "../base_util/deviceArr";
import helperFunctions from "../utils/helperFunctions";
import logger from "../utils/logger";
import messagesFunctions from "../utils/messagesFunctions";
import snmpFunctions from "../utils/snmpFunctions";
// import config from "../config";
const configPath = path.join(__dirname, '../', '../', '../', `config.json`);

const config = require(configPath);

import {
  BaseUserConfig,
  ColumnUserConfig,
  Indexable,
  getBorderCharacters,
  table,
} from "table";

const currentDate = new Date().toLocaleString("ru-RU");
type OidLoaderType = {
  [key: string]: string;
};
type JoidType = {
  [key: string]: {
    [key: string]: string;
  };
};

const devicData = {
  processDDMInfo: async (
    host: string,
    portIfList: string[],
    portIfRange: string[],
    baseOidDDMRXPower: string,
    baseOidDDMTXPower: string,
    baseOidDDMTemperature: string,
    baseOidDDMVoltage: string,
    community: string,
    results: any[],
    unstandart?: boolean,
    eltex?: boolean,
    powerConverter?: (value: number) => number
  ) => {
    const action = devicData.processDDMInfo.name;
    let message = `{"date":"${currentDate}", "action":"${action}", `;
    message += util.format('"%s":"%s", ', "host", host);
    try {
      for (let i = 0; i < portIfList.length; i++) {
        let oidDDMRXPower = baseOidDDMRXPower;
        let oidDDMTXPower = baseOidDDMTXPower;
        let oidDDMTemperature = baseOidDDMTemperature;
        let oidDDMVoltage = baseOidDDMVoltage;

        oidDDMRXPower +=
          unstandart !== undefined
            ? unstandart
              ? portIfList[i] + ".9"
              : eltex
                ? portIfList[i] + ".5.1."
                : portIfList[i]
            : portIfList[i];
        oidDDMTXPower +=
          unstandart !== undefined
            ? unstandart
              ? portIfList[i] + ".8"
              : eltex
                ? portIfList[i] + ".4.1."
                : portIfList[i]
            : portIfList[i];
        oidDDMTemperature +=
          unstandart !== undefined
            ? unstandart
              ? portIfList[i] + ".5"
              : eltex
                ? portIfList[i] + ".1.1."
                : portIfList[i]
            : +portIfList[i];
        oidDDMVoltage +=
          unstandart !== undefined
            ? unstandart
              ? portIfList[i] + ".6"
              : eltex
                ? portIfList[i] + ".2.1."
                : portIfList[i]
            : +portIfList[i];

        const getDDMLevelRX = await snmpFunctions.getSingleOID(
          host,
          oidDDMRXPower,
          community
        );
        const getDDMLevelTX = await snmpFunctions.getSingleOID(
          host,
          oidDDMTXPower,
          community
        );
        const getDDMTemperature = await snmpFunctions.getSingleOID(
          host,
          oidDDMTemperature,
          community
        );
        const getDDMVoltage = await snmpFunctions.getSingleOID(
          host,
          oidDDMVoltage,
          community
        );
        if (
          getDDMLevelTX !== "noSuchInstance" &&
          getDDMLevelTX !== "  -" &&
          getDDMLevelRX !== "noSuchInstance" &&
          getDDMLevelTX !== "NULL" &&
          getDDMLevelRX !== "NULL" &&
          getDDMVoltage !== "0" &&
          getDDMVoltage !== 0
        ) {
          let DDMLevelRX = !unstandart
            ? parseFloat(parseFloat(getDDMLevelRX).toFixed(2))
            : parseFloat((parseFloat(getDDMLevelRX) / 1000).toFixed(2));
          let DDMLevelTX = !unstandart
            ? parseFloat(parseFloat(getDDMLevelTX).toFixed(2))
            : parseFloat((parseFloat(getDDMLevelTX) / 1000).toFixed(2));
          let DDMVoltage = !unstandart
            ? parseFloat(parseFloat(getDDMVoltage).toFixed(2))
            : parseFloat((parseFloat(getDDMVoltage) / 1000000).toFixed(2));
          let DDMTemperature = !unstandart
            ? parseFloat(parseFloat(getDDMTemperature).toFixed(2))
            : parseFloat(parseFloat(getDDMTemperature).toFixed(2));

          if (powerConverter) {
            DDMLevelRX = powerConverter(DDMLevelRX);
            DDMLevelTX = powerConverter(DDMLevelTX);
          }
          results.push([
            portIfRange[i],
            DDMLevelTX,
            DDMLevelTX,
            DDMTemperature,
            DDMVoltage,
          ]);
          message += `"status${i + 1}":"done"${i + 1 === portIfList.length ? "}" : ","}`;
          logger.info(message);
        }
      }
    } catch (error) {
      message += `"error":"${error}"}`;
      logger.error(message);
      return `${symbols.SHORT} Устройство не на связи или при выполнении задачи произошла ошибка! Попробуйте позднее`;
    }
  },
  processADSLInfo: async (
    host: string,
    portIfList: string[],
    portIfRange: string[],
    baseATUcSnrMarg: string,
    baseATUcAttun: string,
    baseATUcPower: string,
    baseATUcRate: string,
    baseATUrSnrMarg: string,
    baseATUrAttun: string,
    baseATUrPower: string,
    baseATUrRate: string,
    community: string,
    results: any[],
    unstandart?: boolean,
    powerConverter?: (value: number) => number
  ) => {
    const action = devicData.processADSLInfo.name;
    let message = `{"date":"${currentDate}", "action":"${action}", `;
    message += util.format('"%s":"%s", ', "host", host);
    console.log(portIfList.length)
    try {
      for (let i = 0; i < portIfList.length; i++) {
        const oidATUcSnrMarg = baseATUcSnrMarg + portIfList[i];
        const oidATUcAttun = baseATUcAttun + portIfList[i];
        const oidATUcPower = baseATUcPower + portIfList[i];
        const oidATUcRate = baseATUcRate + portIfList[i];
        const oidATUrSnrMarg = baseATUrSnrMarg + portIfList[i];
        const oidATUrAttun = baseATUrAttun + portIfList[i];
        const oidATUrPower = baseATUrPower + portIfList[i];
        const oidATUrRate = baseATUrRate + portIfList[i];

        const getATUcSnrMarg = await snmpFunctions.getSingleOID(host, oidATUcSnrMarg, community);
        const getATUcAttun = await snmpFunctions.getSingleOID(host, oidATUcAttun, community);
        const getATUcPower = await snmpFunctions.getSingleOID(host, oidATUcPower, community);
        const getATUcRate = await snmpFunctions.getSingleOID(host, oidATUcRate, community);
        const getATUrSnrMarg = await snmpFunctions.getSingleOID(host, oidATUrSnrMarg, community);
        const getATUrAttun = await snmpFunctions.getSingleOID(host, oidATUrAttun, community);
        const getATUrPower = await snmpFunctions.getSingleOID(host, oidATUrPower, community);
        const getATUrRate = await snmpFunctions.getSingleOID(host, oidATUrRate, community);

        let SnrMargRX = !unstandart
          ? parseFloat(parseFloat(getATUcSnrMarg).toFixed(2))
          : parseFloat((parseFloat(getATUcSnrMarg) / 10).toFixed(2));
        let SnrMargTX = !unstandart
          ? parseFloat(parseFloat(getATUrSnrMarg).toFixed(2))
          : parseFloat((parseFloat(getATUrSnrMarg) / 10).toFixed(2));
        let AttRX = !unstandart
          ? parseFloat(parseFloat(getATUcAttun).toFixed(2))
          : parseFloat((parseFloat(getATUcAttun) / 10).toFixed(2));
        let AttTX = !unstandart
          ? parseFloat(parseFloat(getATUrAttun).toFixed(2))
          : parseFloat((parseFloat(getATUrAttun) / 10).toFixed(2));
        let PowerLevelRX = !unstandart
          ? parseFloat(parseFloat(getATUcPower).toFixed(2))
          : parseFloat((parseFloat(getATUcPower) / 10).toFixed(2));
        let PowerLevelTX = !unstandart
          ? parseFloat(parseFloat(getATUrPower).toFixed(2))
          : parseFloat((parseFloat(getATUrPower) / 10).toFixed(2));

        if (powerConverter) {
          SnrMargRX = powerConverter(SnrMargRX);
          SnrMargTX = powerConverter(SnrMargTX);
          AttRX = powerConverter(AttRX);
          AttTX = powerConverter(AttTX);
          PowerLevelRX = powerConverter(PowerLevelRX);
          PowerLevelTX = powerConverter(PowerLevelTX);
        }

        let snr = `${SnrMargRX}/${SnrMargTX}`
        let att = `${AttRX}/${AttTX}`
        let pwr = `${PowerLevelRX}/${PowerLevelTX}`
        let rate = `${getATUcRate / 1000}/${getATUrRate / 1000}`
        results.push([
          portIfRange[i],
          snr,
          att,
          pwr,
          rate,
        ]);

        message += `"status${i + 1}":"done"${i + 1 === portIfList.length ? "}" : ","}`;
        logger.info(message);

      }
    } catch (error) {
      message += `"error":"${error}"}`;
      logger.error(message);
      return `${symbols.SHORT} Устройство не на связи или при выполнении задачи произошла ошибка! Попробуйте позднее`;
    }
  },

  getDDMInfo: async (host: string, community: string): Promise<string> => {
    const action = devicData.getDDMInfo.name;
    let message = `{"date":"${currentDate}", "action":"${action}", `;
    message += util.format('"%s":"%s", ', "host", host);

    try {
      const results: any[] = [];
      const dirty = await snmpFunctions.getSingleOID(
        host,
        joid.basic_oids.oid_model,
        community
      );

      const model: any = deviceArr.FilterDeviceModel(dirty);
      const JSON_aiflist = await deviceArr.ArrayInterfaceModel(model);
      const aiflist = JSON.parse(JSON_aiflist);
      const portIfList = aiflist.interfaceList;
      const portIfRange = aiflist.interfaceRange;
      const ddm = aiflist.ddm;
      const adsl = aiflist.adsl;
      const fibers = aiflist.fibers;
      const columnConfig: Indexable<ColumnUserConfig> = [
        { width: 8, alignment: "center" }, // IF
        { width: 6, alignment: "center" }, // 🔺Tx
        { width: 6, alignment: "center" }, // 🔻RX
        { width: 5, alignment: "center" }, // 🌡C
        { width: 4, alignment: "center" }, // ⚡️V
      ];

      const config: BaseUserConfig = {
        columns: columnConfig,
        columnDefault: {
          paddingLeft: 0,
          paddingRight: 0,
          // width: 6,
        },
        border: getBorderCharacters(`ramac`),
      };

      if (ddm && fibers === 0) {
        // results.push(`${symbols.WarnEmo} Функция DDM не поддерживается или не реализована`);
        message += `"error":"ddm not supported"}`;
        logger.error(message);
        return `${symbols.WarnEmo} Функция DDM не поддерживается или не реализована\n`;
      } else if (adsl) {
        const columnConfig: Indexable<ColumnUserConfig> = [
          { width: 8, alignment: "center" }, // IF
          { width: 9, alignment: "center" }, // 🔺Tx
          { width: 9, alignment: "center" }, // 🔻RX
          { width: 9, alignment: "center" }, // 🌡C
          { width: 10, alignment: "center" }, // ⚡️V
        ];

        const config: BaseUserConfig = {
          columns: columnConfig,
          columnDefault: {
            paddingLeft: 0,
            paddingRight: 0,
            // width: 6,
          },
          border: getBorderCharacters(`ramac`),
        };
        const oidLoader: OidLoaderType = (joid as JoidType)["adsl_oid"];
        results.push(["IF", "SNR", "Attn", "Pwr", "Rate"]);
        await devicData.processADSLInfo(
          host,
          portIfList,
          portIfRange,
          oidLoader["adslAtucCurrSnrMgn"],
          oidLoader["adslAtucCurrAtn"],
          oidLoader["adslAtucCurrOutputPwr"],
          oidLoader["adslAtucCurrAttainableRate"],
          oidLoader["adslAturCurrSnrMgn"],
          oidLoader["adslAturCurrAtn"],
          oidLoader["adslAturCurrOutputPwr"],
          oidLoader["adslAturCurrAttainableRate"],
          community,
          results,
          true,
        );
        const tab = table(results, config);
        return tab;
      } else {
        // const noDDMport = portIfList.length - fibers;
        // const DDMport = portIfList.length;

        const oidLoaderKey: keyof JoidType = model.includes("SNR")
          ? "snr_oids"
          : model.includes("Eltex")
            ? "eltex_oids"
            : model.includes("DGS") || model.includes("DES")
              ? "dlink_oids"
              : model.includes("SG200-26")
                ? "cisco_oids"
                : "";

        if (oidLoaderKey === "") {
          // results.push(`${symbols.WarnEmo} Функция DDM не поддерживается или не реализована\n\n`);
          message += `"error":"ddm not supported"}`;
          logger.error(message);
          return `${symbols.WarnEmo} Функция DDM не поддерживается или не реализована\n`;
        }
        const oidLoader: OidLoaderType = (joid as JoidType)[oidLoaderKey];
        results.push(["IF", "🔺Tx", "🔻RX", "🌡C", "⚡️V"]);
        // const oidLoader: OidLoaderType = joid[oidLoaderKey];

        if (model.includes("SNR")) {
          await devicData.processDDMInfo(
            host,
            portIfList,
            portIfRange,
            oidLoader["snr_oid_DDMRXPower"],
            oidLoader["snr_oid_DDMTXPower"],
            oidLoader["snr_oid_DDMTemperature"],
            oidLoader["snr_oid_DDMVoltage"],
            community,
            results
          );
        } else if (
          model.includes("Eltex MES14") ||
          model.includes("Eltex MES24") ||
          model.includes("Eltex MES3708")
        ) {
          await devicData.processDDMInfo(
            host,
            portIfList,
            portIfRange,
            oidLoader["eltex_DDM_mes14_mes24_mes_3708"],
            oidLoader["eltex_DDM_mes14_mes24_mes_3708"],
            oidLoader["eltex_DDM_mes14_mes24_mes_3708"],
            oidLoader["eltex_DDM_mes14_mes24_mes_3708"],
            community,
            results,
            false,
            true,
            helperFunctions.mWtodBW
          );
        } else if (
          model.includes("Eltex MES23") ||
          model.includes("Eltex MES33") ||
          model.includes("Eltex MES35") ||
          model.includes("Eltex  MES53")
        ) {
          await devicData.processDDMInfo(
            host,
            portIfList,
            portIfRange,
            oidLoader["eltex_DDM_mes23_mes33_mes35_mes53"],
            oidLoader["eltex_DDM_mes23_mes33_mes35_mes53"],
            oidLoader["eltex_DDM_mes23_mes33_mes35_mes53"],
            oidLoader["eltex_DDM_mes23_mes33_mes35_mes53"],
            community,
            results,
            true
          );
        } else if (
          model.includes("DGS-3620") ||
          model.includes("DES-3200") ||
          model.includes("DGS-3000")
        ) {
          await devicData.processDDMInfo(
            host,
            portIfList,
            portIfRange,
            oidLoader["dlink_dgs36xx_ses32xx_dgs_30xx_ddm_rx_power"],
            oidLoader["dlink_dgs36xx_ses32xx_dgs_30xx_ddm_tx_power"],
            oidLoader["dlink_dgs36xx_ses32xx_dgs_30xx_ddm_temperatura"],
            oidLoader["dlink_dgs36xx_ses32xx_dgs_30xx_ddm_voltage"],
            community,
            results
          );
        } else if (model.includes("SG200-26")) {
          await devicData.processDDMInfo(
            host,
            portIfList,
            portIfRange,
            oidLoader["cisco_DDM_S200"],
            oidLoader["cisco_DDM_S200"],
            oidLoader["cisco_DDM_S200"],
            oidLoader["cisco_DDM_S200"],
            community,
            results
          );
        }
        const tab = table(results, config);
        return tab;
      }
    } catch (error) {
      message += `"error":"${error}"}`;
      logger.error(message);
      return `${symbols.SHORT} Устройство не на связи или при выполнении задачи произошла ошибка! Попробуйте позднее`;
    }
  },

  getBasicInfo: async (
    host: string,
    community: any
  ): Promise<string | false> => {
    let action = devicData.getBasicInfo.name;
    let message = util.format(
      '{"date":"%s", "action":"%s", ',
      currentDate,
      action
    );
    message += util.format('"%s":"%s", ', "host", host);

    const result = util.format(
      "%s Устройство не на связи или при выполнении задачи произошла ошибка! Попробуйте позднее",
      symbols.SHORT
    );

    try {
      const dirty = await snmpFunctions
        .getSingleOID(host, joid.basic_oids.oid_model, community)
        .then((res) => res)
        .catch((err) => err);

      const swSysName = await snmpFunctions
        .getSingleOID(host, joid.basic_oids.oid_sysname, community)
        .then((res) => res);

      const UpTime = await snmpFunctions
        .getSingleOID(host, joid.basic_oids.oid_uptime, community)
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
      message += util.format('"%s":"%s"}', "error", error);
      logger.error(message);
      return result;
    }
  },

  getPortStatus: async (host: string, community: string): Promise<string> => {
    let action = devicData.getPortStatus.name;
    let message = util.format(
      '{"date":"%s", "action":"%s", ',
      currentDate,
      action
    );
    message += util.format('"%s":"%s", ', "host", host);

    try {
      const results = [];
      const getOidValue = async (oid: string) => {
        try {
          return await snmpFunctions.getSingleOID(host, oid, community);
        } catch (error) {
          logger.error(error);
          return error;
        }
      };

      const walkOidValue = async (oid: string) => {
        try {
          return await snmpFunctions.getMultiOID(host, oid, community);
        } catch (error) {
          logger.error(error);
          return error;
        }
      };
      const modelValue = await getOidValue(joid.basic_oids.oid_model);
      const model = deviceArr.FilterDeviceModel(modelValue);

      const JSON_aiflist = await deviceArr.ArrayInterfaceModel(model);
      console.log(model);
      let descrOid = model?.includes("IES-612") || model?.includes("IES1248-51") || model?.includes("SAM1008") ? joid.AAM1212_oid.subrPortName : joid.basic_oids.oid_descr_ports;
      console.log(descrOid);

      const aiflist = JSON.parse(JSON_aiflist);

      const { interfaceList: portIfList, interfaceRange: portIfRange } =
        aiflist;

      const intRange = await walkOidValue(joid.basic_oids.oid_port_name);
      const intList = await walkOidValue(joid.basic_oids.oid_ifIndex);

      // const list =
      //   portIfList === "auto" || portIfList === "server" ? intList : portIfList;
      // const range =
      //   portIfRange === "auto" || portIfRange === "server"
      //     ? intRange
      //     : portIfRange;

      const list = intList;
      const range = intRange;

      for (let ifId in zip(list, range)) {
        if (
          config.excludedSubstrings.some((substring: any) => range[ifId].includes(substring)) || /^\d+$/.test(range[ifId])  // ИЛИ если строка НЕ содержит только цифры
        ) {
          continue; // Пропускаем эту итерацию, если строка содержит исключенные подстроки или не содержит только цифры
        }
        const intDescr = await getOidValue(
          descrOid + list[ifId]
        );
        const portOperStatus = await getOidValue(
          joid.basic_oids.oid_oper_ports + list[ifId]
        );
        const portAdminStatus = await getOidValue(
          joid.basic_oids.oid_admin_ports + list[ifId]
        );
        const get_inerrors = await getOidValue(
          joid.basic_oids.oid_inerrors + list[ifId]
        );

        let operStatus;

        if (portOperStatus == "1") {
          operStatus = symbols.OK_UP;
        } else if (portOperStatus == "2") {
          operStatus = symbols.SHORT;
        } else {
          operStatus = symbols.UNKNOWN;
        }

        if (portAdminStatus == "2") {
          operStatus = util.format("%s", symbols.NOCABLE);
        }

        let fixIntDescr = intDescr;
        let fixIntName = range[ifId];
        if (range[ifId].includes("Huawei")) {
          fixIntName = await getOidValue(joid.linux_server.oid_ifName + '.' + list[ifId]);
        }
        if (intDescr == "noSuchInstance" || intDescr == "noSuchObject") {
          fixIntDescr = "";
        }

        if (parseInt(get_inerrors) == 0) {
          results.push(
            util.format(
              "<code>%s</code> %s | %s",
              fixIntName,
              // range[ifId],
              operStatus,
              fixIntDescr
            )
          );
        } else if (parseInt(get_inerrors) > 0) {
          results.push(
            util.format(
              "<code>%s</code> %s | %s | <i>Ошибки: %s</i> | %s |",
              fixIntName,
              // range[ifId],
              operStatus,
              fixIntDescr,
              get_inerrors,
              symbols.WarnEmo
            )
          );
        }
      }

      const stateInfo = `P.S. Состояния: ${symbols.OK_UP} - Линк есть, ${symbols.SHORT} - Линка нет, ${symbols.NOCABLE} - Порт выключен, ${symbols.UNKNOWN} - Неизвестно`;
      const resultMessage = `${results.join("\n")}\n\n${stateInfo}\n`;
      return resultMessage;
    } catch (e) {
      message += util.format('"%s":"%s"}', "error", e);
      logger.error(e);
      return util.format(
        "%s Устройство не на связи или при выполнении задачи произошла ошибка! Попробуйте позднее",
        symbols.SHORT
      );
    }
  },

  getVlanList: async (host: string, community: string) => {
    let action = devicData.getVlanList.name;
    let message = util.format(
      '{"date":"%s", "action":"%s", ',
      currentDate,
      action
    );
    message += util.format('"%s":"%s", ', "host", host);

    let res: any[] = [];

    try {
      // res.push(['VlanName', 'VlanId'],)

      const vlanName = await snmpFunctions
        .getMultiOID(host, joid.basic_oids.oid_vlan_list, community)
        .then((res) => {
          return res;
        })
        .catch((err) => {
          message += util.format('"%s":"%s"}', "error", err);
          logger.error(message);
          return err;
        });
      const vlanId = await snmpFunctions
        .getMultiOID(host, joid.basic_oids.oid_vlan_id, community)
        .then((res) => {
          return res;
        })
        .catch((err) => {
          message += util.format('"%s":"%s"}', "error", err);
          logger.error(message);
          return err;
        });
      if (!vlanName || !vlanId) {
        throw new Error(messagesFunctions.msgSNMPError(host));
      }
      for (let l in vlanName) {
        res.push(`VlanId: ${vlanId[l]} VlanName: ${vlanName[l]} `);
        // res.push([vlanName[l], vlanId[l]])
      }
      return res.join("\n");
    } catch (e) {
      message += util.format('"%s":"%s"}', "error", e);
      logger.error(message);
      return `${symbols.SHORT} Устройство не на связи или при выполнении задачи произошла ошибка! Попробуйте позднее`;
    }
  },
  // getCableLength: async (host: string, community: string) => {
  //   const action = devicData.getCableLength.name;
  //   let message = util.format(
  //     '{"date":"%s", "action":"%s", ',
  //     currentDate,
  //     action
  //   );
  //   message += util.format('"%s":"%s", ', "host", host);

  //   try {
  //     const results: string[] = [];
  //     const getOidValue = async (oid: string) => {
  //       try {
  //         return await snmpFunctions.getSingleOID(host, oid, community);
  //       } catch (error) {
  //         logger.error(error);
  //         return error;
  //       }
  //     };

  //     const walkOidValue = async (oid: string) => {
  //       try {
  //         return await snmpFunctions.getMultiOID(host, oid, community);
  //       } catch (error) {
  //         logger.error(error);
  //         return error;
  //       }
  //     };

  //     const modelValue = await getOidValue(joid.basic_oids.oid_model);
  //     const model = deviceArr.FilterDeviceModel(modelValue);
  //     const JSON_aiflist = await deviceArr.ArrayInterfaceModel(model);

  //     const aiflist = JSON.parse(JSON_aiflist);
  //     const { interfaceList: portIfList, interfaceRange: portIfRange } =
  //       aiflist;

  //     const intRange = await walkOidValue(joid.linux_server.oid_ifName);
  //     const intList = await walkOidValue(joid.linux_server.oid_ifIndex);

  //     const list =
  //       portIfList === "auto" || portIfList === "server" ? intList : portIfList;
  //     const range =
  //       portIfRange === "auto" || portIfRange === "server"
  //         ? intRange
  //         : portIfRange;
  //     let vct;
  //     if (model && model.includes("SNR")) {
  //       vct = joid.snr_oids.snr_oid_vct;
  //       for (let ifId = 0; ifId < list.length; ifId++) {
  //         const portOperStatus = await getOidValue(
  //           joid.basic_oids.oid_oper_ports + list[ifId]
  //         );
  //         const portAdminStatus = await getOidValue(
  //           joid.basic_oids.oid_admin_ports + list[ifId]
  //         );
  //         if (
  //           portOperStatus == "2" ||
  //           (portOperStatus == "2" && portAdminStatus == "2")
  //         ) {
  //           const set = await snmpFunctions
  //             .setSnmpOID(host, vct, 1)
  //             .then((res) => {
  //               return res;
  //             });
  //           let length;
  //           if (set) {
  //             length = await getOidValue(
  //               joid.snr_oids.snr_oid_vct_res + list[ifId]
  //             );
  //           }
  //           let vtc_r;
  //           let vtc_res = [];
  //           if (length) {
  //             vtc_r = helperFunctions.parseReport(length);
  //             for (let i = 0; i < vtc_r.length; i++) {
  //               vtc_res.push(
  //                 util.format(
  //                   "%s = %s(%s)",
  //                   vtc_r[i].cablePair,
  //                   vtc_r[i].cableLength,
  //                   vtc_r[i].cableStatus
  //                 )
  //               );
  //             }
  //           }
  //           logger.info(
  //             util.format(
  //               "%s %s %s %s",
  //               range[ifId],
  //               portOperStatus,
  //               portAdminStatus,
  //               vtc_res.join("\n")
  //             )
  //           );
  //           results.push(
  //             util.format(
  //               "<code>%s</code>\n%s",
  //               range[ifId],
  //               vtc_res.join("\n")
  //             )
  //           );
  //         }
  //       }
  //       // const stateInfo = `P.S. Состояния: ${symbols.OK_UP} - Линк есть, ${symbols.SHORT} - Линка нет, ${symbols.NOCABLE} - Порт выключен, ${symbols.UNKNOWN} - Неизвестно`;
  //       const resultMessage = `${results.join("\n")}\n\n`;
  //       return resultMessage;
  //     } else {
  //       const resultMessage = `nКоммутатор не поддерживает кабельную диагностику`;
  //       return resultMessage;
  //     }
  //   } catch (error) {
  //     const errorMessage = util.format(
  //       "%s Устройство не на связи или при выполнении задачи произошла ошибка! Попробуйте позднее",
  //       symbols.SHORT
  //     );
  //     logger.error(errorMessage);
  //     return errorMessage;
  //   }
  // },
  getCableLength: async (host: string, community: string) => {
    try {
      const results: string[] = [];
      const modelValue = await snmpFunctions.getSingleOID(
        host,
        joid.basic_oids.oid_model,
        community
      );
      const model = deviceArr.FilterDeviceModel(modelValue);

      if (model && model.includes("SNR")) {
        const aiflist = JSON.parse(await deviceArr.ArrayInterfaceModel(model));
        const { interfaceList: portIfList } = aiflist;

        for (let ifId = 0; ifId < portIfList.length; ifId++) {
          const portOperStatus = await snmpFunctions.getSingleOID(
            host,
            joid.basic_oids.oid_oper_ports + portIfList[ifId],
            community
          );
          const portAdminStatus = await snmpFunctions.getSingleOID(
            host,
            joid.basic_oids.oid_admin_ports + portIfList[ifId],
            community
          );

          if (
            portOperStatus == "2" ||
            (portOperStatus == "2" && portAdminStatus == "2")
          ) {
            const set = snmpFunctions.setSnmpOID(
              host,
              joid.snr_oids.snr_oid_vct + portIfList[ifId],
              1
            );
            let vtc_res = [];
            let vtc_r;
            if (set) {
              const length = await snmpFunctions.getSingleOID(
                host,
                joid.snr_oids.snr_oid_vct_res + portIfList[ifId],
                community
              );
              vtc_r = helperFunctions.parseReport(length);
              if (length) {
                for (let i = 0; i < vtc_r.length; i++) {
                  vtc_res.push(
                    util.format(
                      "%s = %s(%s)",
                      vtc_r[i].cablePair,
                      vtc_r[i].cableLength,
                      vtc_r[i].cableStatus
                    )
                  );
                }
              }
            }

            logger.info(
              util.format(
                "%s %s %s %s",
                portIfList[ifId],
                portOperStatus,
                portAdminStatus,
                vtc_res
              )
            );
            results.push(
              util.format(
                "<code>%s</code>\n%s",
                portIfList[ifId],
                JSON.stringify(vtc_res.join("\n"))
              )
            );
          }
        }
        const resultMessage = `${results.join("\n")}\n\n`;
        return resultMessage;
      } else {
        const resultMessage = `Коммутатор не поддерживает кабельную диагностику`;
        return resultMessage;
      }
    } catch (error) {
      const errorMessage = util.format(
        "%s Устройство не на связи или при выполнении задачи произошла ошибка! Попробуйте позднее",
        symbols.SHORT
      );
      logger.error(error);
      return errorMessage;
    }
  },

  runNetmikoScript: (): Promise<string> => {
    const options: Options = {
      mode: "json",
      pythonOptions: ["-u"], // unbuffered output
      scriptPath: "/", // путь к файлу netmiko_script.py
    };

    return new Promise(() => {
      PythonShell.runString("ps.py", options).then((messages) => {
        logger.info(messages);
      });
    });
  },
};

export default devicData;
