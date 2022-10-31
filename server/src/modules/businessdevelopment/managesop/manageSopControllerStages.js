const getPerformanceRatingSummaryStages = () => {
    return [
        {
            $match: {
                role: { $in: ["bdt", "bdat", "bda"] }
            }
        },
        {
            $project: {
                date: 1,
                notAvailableCount : {$cond: [{ $eq: ["$performanceRating", "not_available"] }, 1, 0] },
                qraRiskRatingCount: { $cond: [{ $eq: ["$performanceRating", "qra_risk"] }, 1, 0] },
                averageRatingCount: { $cond: [{ $eq: ["$performanceRating", "average"] }, 1, 0] },
                goodRatingCount: { $cond: [{ $eq: ["$performanceRating", "good"] }, 1, 0] }
            }
        }, {
            $group: {
                _id: "$date",
                date: { "$first": "$date" },
                totalCount: { $sum: 1 },
                notAvailableCount: { $sum: "$notAvailableCount" },
                qraRiskRatingCount: { $sum: "$qraRiskRatingCount" },
                averageRatingCount: { $sum: "$averageRatingCount" },
                goodRatingCount: { $sum: "$goodRatingCount" }
            }
        }
    ]
}

module.exports={
    getPerformanceRatingSummaryStages
}