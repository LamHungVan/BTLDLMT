import axiosClient from "./axiosClient";

const getDataApi = {
    getTemperatureData(params) {
        const url = 'api/SensorLogs/Temperature';
        return axiosClient.get(url, {params});
    },

    getHumidityData(params) {
        const url = 'api/SensorLogs/Humidity';
        return axiosClient.get(url, {params});
    },

    updateMotorStatus(value) {
        const url = `api/Motor/status/${value}`
        return axiosClient.post(url);
    },
    
    updateMotorRotate(value) {
        const url = `api/Motor/rotate/${value}`
        return axiosClient.post(url);
    }
    
};


export default getDataApi;