/**
 * 分组查询，多条件，排序
 */
db.getCollection('DS_TEMPLATE20180329000002').aggregate([
    { $match: { captureTime: { '$gte': ISODate("2019-07-28 06:33:00.000Z"), '$lt': ISODate("2019-11-02 15:59:59.000Z") } } },
    {
        $group: {
            '_id': '$parentUrl',
            'count': { '$sum': 1 }
        }
    }, { $sort: { count: -1 } }
])
/***
 * 分库分表
 *
 *
 */