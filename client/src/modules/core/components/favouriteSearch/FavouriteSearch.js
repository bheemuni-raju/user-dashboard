import { callApi } from "store/middleware/api";

/** Get Favourite Filter for a particular gridd and user in ByjusGrid */
const getFavouriteFilter = async(gridId, uerId) => {
    let favouriteFilterResponse = {
        favouriteFilter: [],
        searchCriteriasOptions: []
    }
    await callApi(`/usermanagement/common/favouriteFilter/${gridId}/${uerId}`, 'GET', null, null, null, true)
    .then(response => {
        if (response.response.length > 0) {
            const respList =  response.response
            const favouriteFilterArray = []
            respList.map((ls)=> {
                const favouriteFilterOption = {
                    label: ls.name,
                    value: ls.formattedName 
                }
                favouriteFilterArray.push(favouriteFilterOption)
            })
            favouriteFilterResponse = {
                favouriteFilter: favouriteFilterArray,
                searchCriteriasOptions: respList
            }
        }
    })
    .catch(error => {
        favouriteFilterResponse = {
            favouriteFilter: [],
            searchCriteriasOptions: []
        }
    })
    return favouriteFilterResponse
}

/** Remove Element from Favoutite Filter List */
const removeFavouriteFilter = async (query, gridId, emailId) => {
    const payload = {
        queryName: query.formattedName,
        gridId,
        emailId
    }
    let isRemove = false
    await callApi(`/usermanagement/common/remove/favouriteFilter`, 'PUT', payload, null, null, true)
    .then(response => {
        isRemove = true
    })
    return isRemove
}

export {
    getFavouriteFilter,
    removeFavouriteFilter
}
