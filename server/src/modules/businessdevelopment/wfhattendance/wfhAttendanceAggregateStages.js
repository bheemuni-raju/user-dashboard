const getAggregateStages = async (filter, groupBy) => {
    let groupByDimension = {};
    groupBy.forEach(element => {
        groupByDimension[element] = `$${element}`
    });

    return [{
        "$match": filter
    }, {
        "$addFields": {
            meetingYetToBeMarked: {
                "$cond": [{
                    $or: [
                        { $eq: ["$meetingAttendanceStatus", ""] },
                        { $eq: ["$meetingAttendanceStatus", "meeting_attendance_marking_open"] }
                    ]
                }, 1, 0]
            },
            meetingMarked: {
                "$cond": [{
                    $or: [
                        { $eq: ["$meetingAttendanceStatus", "not_attended"] },
                        { $eq: ["$meetingAttendanceStatus", "attended"] }
                    ]
                }, 1, 0]
            },
            meetingNotMarked: {
                "$cond": [{
                    $or: [
                        { $eq: ["$meetingAttendanceStatus", "not_marked"] }
                    ]
                }, 1, 0]
            },
            meetingAttended: {
                "$cond": [{
                    $and: [
                        { $eq: ["$meetingAttendanceStatus", "attended"] }
                    ]
                }, 1, 0]
            },
            meetingNotAttended: {
                "$cond": [{
                    $and: [
                        { $eq: ["$meetingAttendanceStatus", "not_attended"] }
                    ]
                }, 1, 0]
            },
            talktimeYetToBeUploaded: {
                "$cond": [{
                    $and: [
                        { $eq: ["$talktime", -1] }
                    ]
                }, 1, 0]
            },
            talktimeUploaded: {
                "$cond": [{
                    $and: [
                        { $eq: ["$talktime", -1] }
                    ]
                }, 0, 1]
            },
            tmOpenForDiscussion: {
                "$cond": [{
                    $and: [
                        { $eq: ["$reportingManagerRequest.workflowStatus", "manager_dispute_open"] }
                    ]
                }, 1, 0]
            },
            tmRequestRaised: {
                "$cond": [{
                    $and: [
                        { $eq: ["$reportingManagerRequest.workflowStatus", "request_raised"] }
                    ]
                }, 1, 0]
            },
            tmRequestApproved: {
                "$cond": [{
                    $and: [
                        { $eq: ["$reportingManagerRequest.workflowStatus", "approved"] }
                    ]
                }, 1, 0]
            },
            tmRequestRejected: {
                "$cond": [{
                    $and: [
                        { $eq: ["$reportingManagerRequest.workflowStatus", "rejected"] }
                    ]
                }, 1, 0]
            },
            spOpenForDiscussion: {
                "$cond": [{
                    $and: [
                        { $eq: ["$salesPersonRequest.workflowStatus", "bda_dispute_open"] }
                    ]
                }, 1, 0]
            },
            spRequestRaised: {
                "$cond": [{
                    $and: [
                        { $eq: ["$salesPersonRequest.workflowStatus", "request_raised"] }
                    ]
                }, 1, 0]
            },
            spRequestApproved: {
                "$cond": [{
                    $and: [
                        { $eq: ["$salesPersonRequest.workflowStatus", "approved"] }
                    ]
                }, 1, 0]
            },
            spRequestRejected: {
                "$cond": [{
                    $and: [
                        { $eq: ["$salesPersonRequest.workflowStatus", "rejected"] }
                    ]
                }, 1, 0]
            }
        }
    }, {
        "$group": {
            _id: groupByDimension,
            total: { "$sum": 1 },
            meetingYetToBeMarked: { "$sum": "$meetingYetToBeMarked" },
            meetingMarked: { "$sum": "$meetingMarked" },
            meetingNotMarked: { "$sum": "$meetingNotMarked" },
            meetingAttended: { "$sum": "$meetingAttended" },
            meetingNotAttended: { "$sum": "$meetingNotAttended" },
            talktimeYetToBeUploaded: { "$sum": "$talktimeYetToBeUploaded" },
            talktimeUploaded: { "$sum": "$talktimeUploaded" },
            tmOpenForDiscussion: { "$sum": "$tmOpenForDiscussion" },
            tmRequestRaised: { "$sum": "$tmRequestRaised" },
            tmRequestApproved: { "$sum": "$tmRequestApproved" },
            tmRequestRejected: { "$sum": "$tmRequestRejected" },
            spOpenForDiscussion: { "$sum": "$spOpenForDiscussion" },
            spRequestRaised: { "$sum": "$spRequestRaised" },
            spRequestApproved: { "$sum": "$spRequestApproved" },
            spRequestRejected: { "$sum": "$spRequestRejected" },
        }
    }];
}

module.exports = {
    getAggregateStages
};