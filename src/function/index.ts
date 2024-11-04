import axios from "axios"

const baseURL = 'http://localhost:4000'

export const SendDeatils = async (adhaar:any) =>{
    try {
        const response = await axios.post(`${baseURL}/api/submit`,adhaar)
        console.log(response.data)
        return response
    } catch (error) {
        console.log(error)
    }
}
