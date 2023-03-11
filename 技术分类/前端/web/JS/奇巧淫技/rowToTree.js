var rows = [{
    parent: 'root',
    id: 'DC',
    title: '集团'
},
{
    parent: 'DC',
    id: '01',
    title: '上海本部'
},
{
    parent: 'DC',
    id: '02',
    title: '中华企业'
},
{
    parent: '02',
    id: '0200',
    title: '中华企业股份有限公司本部'
},
{
    parent: '02',
    id: '0201',
    title: '上海古北（集团）有限公司'
},
{
    parent: '0201',
    id: '020100',
    title: '上海古北（集团）有限公司本部'
},
{
    parent: '0201',
    id: '020101',
    title: '上海古北顾村置业有限公司'
},
{
    parent: '0201',
    id: '020102',
    title: '上海古北京宸置业发展有限公司'
},
{
    parent: '0201',
    id: '020103',
    title: '苏州洞庭房地产发展有限公司'
}]
function listToTree(list) {
    len = list.length
    let tree = {}

    for (let i = 0; i < len; i++) {
        tree[list[i].parent] = []
    }
    for (const key in tree) {
        if (tree.hasOwnProperty(key)) {
            const arr = tree[key];
            for (let index = 0; index < len; index++) {
                const element = list[index];
                if (element.parent == key) {
                    arr.push(element)
                }
            }

        }
    }
    return tree
}

console.log(listToTree(rows))