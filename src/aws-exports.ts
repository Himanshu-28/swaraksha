const awsConfig = {
    Auth: {
        Cognito: {
            userPoolId: 'ap-south-1_byWYZ74sf',
            userPoolClientId: '9i71gb2d2jbuam78o7rteh69r',
        }
    }
};

export const API_ENDPOINT = 'https://i6a1l4o09d.execute-api.ap-south-1.amazonaws.com/prod';
export const SOAP_API_ENDPOINT = `${API_ENDPOINT}/soap/generate`;
export const PRESCRIPTION_API_ENDPOINT = 'https://ll2nm2qqfc.execute-api.ap-south-1.amazonaws.com/prod/prescription/extract';

export default awsConfig;
