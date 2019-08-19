export const sessionExpMsg: MessageModel = {
    title: "Session Expired",
    text: "You will be redirected to the home Page"
}

export const currErrMsg: MessageModel = {
    title: 'Conversion Failed',
    text: 'Currency conversion rates are not available. Please select any other currency, or try again later.'
}




export interface MessageModel {
    title?: string
    text?: string,
}