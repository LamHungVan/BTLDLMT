import axiosClient from "./axiosClient";

const getDataApi = {
    getData(params) {
        const url = 'api/Sensor/data';
        return axiosClient.get(url, {params});
    }
};


export default getDataApi;