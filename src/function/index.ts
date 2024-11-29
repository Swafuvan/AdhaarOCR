import axios from "axios"
import dotenv from 'dotenv';
dotenv.config();

const baseURL = process.env.NEXT_PUBLIC_URL+'';

export const SendDeatils = async (adhaar:any) =>{
    try {
        const response = await axios.post(`${baseURL}/api/submit`,adhaar)
        console.log(response.data)
        return response
    } catch (error) {
        console.log(error)
    }
}
