export default interface User {
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role?: string,
    birthDate: string | Date,
    address: string,
    countryCode: string,
    phoneNo1: string,
    phoneNo2?: string,
    image?: string,
    verificationCode: string,
}
