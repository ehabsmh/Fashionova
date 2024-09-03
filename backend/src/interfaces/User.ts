export default interface User {
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role?: string,
    birthDate: string | Date,
    address: String,
    phone1: number,
    phone2?: number,
    image?: string,
    verificationCode: string,
}
