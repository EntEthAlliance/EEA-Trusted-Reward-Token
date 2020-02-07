export interface ResponseResult { 
    success: boolean,
    message:string
}

export function ResultOk(message?:string) { 
    return <ResponseResult>{ success: true, message: message };
}

export function ResultFail(message?: string) {
    return <ResponseResult>{ success: false, message: message };
}