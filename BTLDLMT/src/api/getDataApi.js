import axiosClient from "./axiosClient";

const getDataApi = {
    getData(params) {
        const url = 'api/SensorLogs';
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