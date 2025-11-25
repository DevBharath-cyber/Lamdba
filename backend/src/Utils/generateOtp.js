const generateOtp = () => {
    const otp = Math.floor(100000 + Math.random() *90000 );
    return otp;
}
export default generateOtp;