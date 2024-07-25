// const asyncHandler = () => {}
// const asyncHandler = (fn) => { () => {} }
// const asyncHandler = (fn) => {async () => {} }
// const asyncHandler = (fn) => {async () => {
//                                   try{ 
//                                     await fn()
//                                     } catch(err){
//                                      console.log(err)
//                                     }
//                                     }}
    

export function asyncHandler(fn) {
    return async function (req, res, next) {
        try {
            let result = await fn(req, res, next);
            return result;
        } catch (err) {
            res.status(err.code || 500).json({
                success: false,
                message: err.message
            });
        }
    };
}

    
// export const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (err) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }
    

// export const asyncHandler = (fn) => {
//     return (req, res, next) => {
//         Promise.resolve(fn(req, res, next)).catch((err) => next(err))
//     }
// }




