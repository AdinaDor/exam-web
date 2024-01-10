'use-strict'

let currentPage = 1;
let perPage = 5;

function GetUrl(path) {
    let url = new URL(`http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/${path}`);
    url.searchParams.set("api_key", "267fbb90-be57-489a-83ff-9678ee19c6de");

    return url;
}

function CreateIcon(name) {
    let icon = document.createElement('i');
    icon.classList.add('bi');
    icon.classList.add('mx-1');
    icon.classList.add(name);

    return icon;
}

async function GetRoute(id) {
    let response = await fetch(GetUrl('routes/' + id));
    let json = await response.json();
    return json.name;
}

function Order(id, date, time, duration, persons, price, routeId, routeName, guideId, optionFirst, optionSecond) {
    this.id = id;
    this.date = date;
    this.time = time;
    this.duration = duration;
    this.persons = persons;
    this.price = price;
    this.routeId = routeId;
    this.routeName = routeName;
    this.guideId = guideId;
    this.optionFirst = optionFirst;
    this.optionSecond = optionSecond;

    this.CreateElement = () => {
        let tr = document.createElement('tr');

        let id = document.createElement('th');
        id.innerHTML = this.id;
        tr.append(id);

        let name = document.createElement('td');
        name.innerHTML = this.routeName;
        tr.append(name);

        let date = document.createElement('td');
        date.innerHTML = this.date;
        tr.append(date);

        let price = document.createElement('td');
        price.innerHTML = this.price + ' рублей';
        tr.append(price);

        let buttons = document.createElement('td');
        buttons.append(CreateIcon('bi-eye'));
        buttons.append(CreateIcon('bi-pencil'));
        buttons.append(CreateIcon('bi-x'));
        tr.append(buttons);

        return tr;
    }

    this.AddToDocument = () => {
        let table = document.querySelector('#orderTable');
        table.append(this.CreateElement());
    }
}


async function GetOrders() {
    let response = await fetch(GetUrl('orders'));

    let orders = [];
    let items = await response.json();
    for (let i = 0; i < items.length; i++) {
        let routeName = await GetRoute(items[i].route_id);

        let item = new Order(items[i].id, items[i].date, items[i].time, items[i].duration, items[i].persons,
            items[i].price, items[i].route_id, routeName, items[i].guide_id, items[i].optionFirst, items[i].optionSecond);

        orders.push(item);
    }
    sessionStorage.setItem('orders', JSON.stringify(orders));
}


function CreateLi(name, value, active) {
    let li = document.createElement('li');
    li.classList.add('page-item');
    let link = document.createElement('a');
    link.innerHTML = name;
    link.classList.add('page-link');
    link.classList.add('link');
    link.onclick = () => {
        DisplayOrder(value);
    };
    li.append(link);

    if (active) {
        link.classList.add('text-white');
        link.classList.add('primary');
    }

    return li;
}

function DisplayPages(page) {
    let pages = document.querySelector('.pagination');
    pages.innerHTML = '';

    pages.append(CreateLi('Первая страница', 1));

    let items = JSON.parse(sessionStorage.getItem('orders'));
    let start = Math.max(page - 2, 1);
    let last = Math.ceil(items.length / perPage);
    let end = Math.min(page + 2, last);
    for (let i = start; i <= end; i++) {
        pages.append(CreateLi(i, i, page == i));
    }

    pages.append(CreateLi('Последняя страница', last));

}

function DisplayError(block, message) {
    let div = document.createElement('div');
    div.classList.add('alert');
    div.classList.add('alert-danger');
    div.innerHTML = message;
    block.append(div);
    setTimeout(() => div.remove(), 5000);
}

function DisplayOrder(page) {
    let items = JSON.parse(sessionStorage.getItem('orders'));

    document.querySelector('#orderTable').innerHTML = '';

    DisplayPages(page);

    let end = Math.min(page * perPage, items.length);
    for (let i = (page - 1) * perPage; i < end; i++) {
        new Order(items[i].id, items[i].date, items[i].time, items[i].duration, items[i].persons,
            items[i].price, items[i].routeId, items[i].routeName, items[i].guideId, items[i].optionFirst, items[i].optionSecond).AddToDocument();
    }
}

window.onload = async () => {
    await GetOrders();
    DisplayOrder(1);

}