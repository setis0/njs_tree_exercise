const Tree = require('./tree_data_mock.js');

function incValue(node_id, value_increment) {
    const [root] = Tree.filter(value => value.default_parent && value.default_parent === true)
    if (!root) {
        throw new Error(`не найден корневой узел`)
    }
    if (value_increment < 1) {
        //value_increment - величина усвличения значения value, всегда положительное число
        throw new Error(`value_increment ${value_increment} в условия всегда положительное`)
    }
    const [found] = Tree.filter(value => value.id === node_id)
    if (!found) {
        throw new Error(`не найден id:${node_id}`)
    }
    let list = []
    if (found.id === root.id) {
        list.push([root])
    } else {
        list.push([found])
        let parent_id = list[0][0]?.parent_id || root.id;
        let prev = null
        while (parent_id !== null && prev !== parent_id) {
            list.unshift(Tree.filter(value => value.id === parent_id))
            prev = parent_id
            parent_id = list[0][0].parent_id || root.id;
        }
    }
    const calc = (level, value_increment) => {
        const result = (level === 0)
            //Для первого узла (для которого и была вызвана функция incValue), на величину value_increment
            ? value_increment
            //Для каждого последующего родительского узла, на 1/4 значения от предыдущего. Т.е. для родителя стартового узла это будет 1/4 value_increment, для родителя родителя ("деда" стартового) - 1/16 value_increment, для его родителя ("прадеда" стартового) - 1/64 value_increment и т.д.
            : value_increment / Math.pow(4, level)
        return (val) => {
            val.value = val.value + result
            return val
        }
    }
    const inc = value_increment / 10
    for (const [level, arr] of list.reverse().entries()) {
        const call = calc(level, value_increment)
        if (level === 1 && arr.length > 1) {
            arr
                .forEach((el, i) => {
                    //Если у родителя посещаемого узла есть другие узлы - "дети", помимо того узла, от кого он получил входящее значение, то им необходимо увеличить значение value на 1/10 от значения увеличения в данном узле (т.е. если значение узла увеличивается на 20, то все "братья", должны увеличиться на 2), но не более чем на уже имеющееся у "брата" значение value (т.е. если значение увеличения для конкретного "брата" равно 10, а value у самого брата 9, то ему полагается только 9. Иными словами нельзя увеличивать значение у "брата" более чем в 2 раза за шаг)
                    //@todo если можно нормально разобрать я бы сделал , но тратить на расшифровку тестовое задачу
                    // Tree[i].value = el.value+el.value/10
                })
        }
        for (const id of arr.map(value => value.id)) {
            for (const [i, el] of Tree.entries()) {
                if (el.id === id) {
                    Tree[i] = call(el)
                    break
                }
            }
        }
    }
}

function check() {
    for (const [i, val] of Tree.entries()) {
        const list = Object.keys(val)
        for (const d of list) {
            if (d !== d.toLowerCase()) {
                Tree[i][d.toLowerCase()] = Tree[i][d];
                delete Tree[i][d]
            }
        }
        if (typeof val.value == "string") {
            try {
                Tree[i].value = parseFloat(val.value)
            } catch (e) {
                Tree[i].value = 0;
                console.log(e.message)
            }
        } else if (typeof val.value !== "number") {
            val.value = 0
        }

    }
}

check()
// Test cases
try {
    incValue(1701, -1701);
} catch (e) {
    console.log(e.message)
}
incValue(303, 303);
incValue(9000, 9000);

// Print-out the result
console.log(JSON.stringify(Tree, null, "\t"));
