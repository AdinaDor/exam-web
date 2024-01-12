'use-strict'

let currentPage = 1;
let perPage = 5;
let selectedRoute;
let selectedGuide;
let searchedGuides;

function ClearSelection(name) {
    let table = document.getElementById(name);

    for (let row of table.children) {
        row.classList.remove('table-secondary');
    }
}

function SetLanguages() {
    let items = JSON.parse(sessionStorage.getItem('guides'));
    let select = document.getElementById('languages');
    select.innerHTML = '';

    let objs = [];
    objs.push('Любой');
    for (let i = 0; i < items.length; i++) {
        objs.push(items[i].language);
    }
    for (let obj of objs) {
        let option = document.createElement("option");
        option.innerHTML = obj;
        option.setAttribute("value", obj);
        select.appendChild(option);
    }
}

function DisplayOrder() {
    let ordereBlock = document.getElementById('order');

    if (selectedRoute === undefined || selectedGuide === undefined) {
        ordereBlock.classList.add('hide');
    }
    else {
        ordereBlock.classList.remove('hide');
    }
}

async function RouteButtonHandler(item, tableRow) {
    selectedRoute = item;
    ClearSelection('routeTableBody');
    tableRow.classList.add('table-secondary');

    let guides = document.getElementById('guide');
    guides.classList.remove('hide');
    let header = document.querySelector('.guide-route');
    header.innerHTML = `Доступные гиды по маршруту ${item.name}`;
    await GetGuides(item.id);
    searchedGuides = [];
    DisplayGuides();
    SetLanguages();

    DisplayOrder();
}

function GuideButtonHandler(item, tableRow) {
    selectedGuide = item;
    ClearSelection('guideTable');
    tableRow.classList.add('table-secondary');

    DisplayOrder();
}

function GetUrl(path) {
    let url = new URL(`https://edu.std-900.ist.mospolytech.ru/api/${path}`);
    url.searchParams.set("api_key", "86ee123c-0bda-4afa-8278-d341cdad90be");

    return url;
}

async function GetRoutes() {
    let response = await fetch(GetUrl('routes'));

    let routes = [];
    let items = await response.json();
    for (let i = 0; i < items.length; i++) {
        let item = {};
        item['id'] = items[i].id;
        item['name'] = items[i].name;
        item['description'] = items[i].description;
        item['mainObject'] = items[i].mainObject;

        routes.push(item);
    }
    sessionStorage.setItem('routes', JSON.stringify(routes));

    DisplayRoutes(1)
}

function GetGuidesFromStorage() {
    let items = searchedGuides;
    if (items == undefined || items.length == 0) {
        items = JSON.parse(sessionStorage.getItem('guides'));
    }
    return items;
}

function DisplayGuides() {

    let table = document.getElementById('guideTable');
    let items = GetGuidesFromStorage();
    table.innerHTML = '';

    for (let i = 0; i < items.length; i++) {
        let tr = document.createElement('tr');

        if (selectedGuide != undefined && items[i].id == selectedGuide.id) {
            tr.classList.add('table-secondary');
        }

        let img = document.createElement('th');
        let icon = document.createElement('i');
        icon.classList.add('bi');
        icon.classList.add('bi-person-circle');
        img.append(icon);
        tr.append(img);

        let name = document.createElement('th');
        name.innerHTML = items[i].name;
        tr.append(name);

        let language = document.createElement('td');
        language.innerHTML = items[i].language;
        tr.append(language);

        let workExperience = document.createElement('td');
        workExperience.innerHTML = items[i].workExperience;
        tr.append(workExperience);

        let price = document.createElement('td');
        price.innerHTML = items[i].pricePerHour + ' руб/час';
        tr.append(price);

        let buttonTd = document.createElement('td');
        let button = document.createElement('button');
        button.innerHTML = 'Выбрать';
        button.classList.add('btn', 'btn-success', 'custom-button-style');
        button.classList.add('primary');
        button.classList.add('text-white');
        button.style.color = 'blue';
        button.onclick = () => {
            GuideButtonHandler(items[i], tr);
        };
        buttonTd.append(button);
        tr.append(buttonTd);

        table.append(tr);
    }
}

async function GetGuides(id) {
    let response = await fetch(GetUrl(`routes/${id}/guides`));
    let items = await response.json();
    sessionStorage.setItem('guides', JSON.stringify(items));
}

function CreateLi(name, value, active) {
    let li = document.createElement('li');
    li.classList.add('page-item');
    let link = document.createElement('a');
    link.innerHTML = name;
    link.classList.add('page-link');
    link.classList.add('link');
    link.onclick = () => {
        DisplayRoutes(value);
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

    let items = GetRoutesFromStorage();
    let start = Math.max(page - 2, 1);
    let last = Math.ceil(items.length / perPage);
    let end = Math.min(page + 2, last);
    for (let i = start; i <= end; i++) {
        pages.append(CreateLi(i, i, page == i));
    }

    pages.append(CreateLi('Последняя страница', last));

}

function GetRoutesFromStorage() {
    let items = JSON.parse(sessionStorage.getItem('searched-routes'));
    if (items == undefined) {
        items = JSON.parse(sessionStorage.getItem('routes'));
    }
    return items;
}


function DisplayRoutes(page) {
    let table = document.getElementById('routeTableBody');
    let items = GetRoutesFromStorage();
    DisplayPages(page);
    table.innerHTML = '';

    ClearSelection('routeTableBody');

    let end = Math.min(page * perPage, items.length);
    for (let i = (page - 1) * perPage; i < end; i++) {
        let tr = document.createElement('tr');

        if (selectedRoute != undefined && items[i].id == selectedRoute.id) {
            tr.classList.add('table-secondary');
        }

        let name = document.createElement('th');
        name.innerHTML = items[i].name;
        tr.append(name);

        let descr = document.createElement('td');
        descr.innerHTML = items[i].description;
        tr.append(descr);

        let obj = document.createElement('td');
        obj.innerHTML = items[i].mainObject;
        tr.append(obj);

        let buttonTd = document.createElement('td');
        let button = document.createElement('button');
        button.innerHTML = 'Выбрать';
        button.classList.add('btn', 'btn-success', 'custom-button-style');
        button.classList.add('primary');
        button.classList.add('text-white');
        button.style.color = 'blue';
        button.onclick = () => {
            RouteButtonHandler(items[i], tr);
        };
        buttonTd.append(button);
        tr.append(buttonTd);

        table.append(tr);
    }
}

function SetObjects() {
    let items = JSON.parse(sessionStorage.getItem('routes'));
    let select = document.getElementById('objects');
    select.innerHTML = '';

    let objs = [];
    objs.push('Любой');
    for (let i = 0; i < items.length; i++) {
        objs.push(items[i].mainObject);
    }
    for (let obj of objs) {
        let option = document.createElement("option");
        option.innerHTML = obj;
        option.setAttribute("value", obj);
        select.appendChild(option);
    }
}

function SearchRoute(form) {
    let items = JSON.parse(sessionStorage.getItem('routes'));
    let search = form.elements['search'].value;
    let select = form.elements['objects'].value;

    let searched = [];
    if (search != undefined || search != '') {
        for (let i = 0; i < items.length; i++) {
            if (items[i].name.includes(search)) {
                searched.push(items[i]);
            }
        }
    }
    if (select != 'Любой') {
        for (let i = 0; i < searched.length; i++) {
            if (!searched[i].mainObject.includes(select)) {
                searched.splice(i, 1);
                i--;
            }
        }
    }

    sessionStorage.setItem('searched-routes', JSON.stringify(searched));
    DisplayRoutes(1);
}

function DisplayError(block, message) {
    let div = document.createElement('div');
    div.classList.add('alert');
    div.classList.add('alert-danger');
    div.innerHTML = message;
    block.append(div);
    setTimeout(() => div.remove(), 5000);
}

function SearchGuide(form) {
    let items = JSON.parse(sessionStorage.getItem('guides'));
    let languages = form.elements['languages'].value;
    let from = +form.elements['xpFrom'].value;
    let to = +form.elements['xpTo'].value;

    let searched = [];
    if (languages != 'Любой') {
        for (let i = 0; i < items.length; i++) {
            if (items[i].language.includes(languages)) {
                searched.push(items[i]);
            }
        }
    }
    else {
        for (let i = 0; i < items.length; i++) {
            searched.push(items[i]);
        }
    }

    if (from >= to) {
        DisplayError(document.querySelector('.guide-error-block'), 'Значение ОТ должно быть меньше ДО');
    }
    else {
        for (let i = 0; i < searched.length; i++) {
            if (searched[i].workExperience < from || searched[i].workExperience > to) {
                searched.splice(i, 1);
                i--;
            }
        }
    }

    searchedGuides = searched;
    if (searched.length == 0) {
        DisplayError(document.querySelector('.guide-error-block'), 'Подходящие гиды не найдены, выведены доступныые гиды');
    }
    DisplayGuides();
}

function GetDatePrice(date) {
    let isWeekend = (date >= '2024-01-01' && date < '2024-01-09') ||
        new Date(date).getDay() == 6 && !['2024-04-27', '2024-11-02', '2024-12-28'].includes(date) ||
        new Date(date).getDay() == 7 ||
        ['2024-02-23', '2024-03-08', '2024-04-29', '2024-04-30', '2024-05-01', '2024-05-09',
            '2024-05-10', '2024-06-12', '2024-11-04', '2024-12-30', '2024-12-31'].includes(date);
    return isWeekend ? 1.5 : 1;
}

function UpdateForm(modal) {
    let duration = modal.target.querySelector('#duration').value;
    let count = modal.target.querySelector('#count').value;
    let time = modal.target.querySelector('#time').value;
    let date = modal.target.querySelector('#date').value;
    let option1 = modal.target.querySelector('#option1').checked;
    let option2 = modal.target.querySelector('#option2').checked;
    let btn = modal.target.querySelector('#modal-submit');

    let hour = +time.split(':')[0];
    let minutes = +time.split(':')[1];
    if (!(hour >= 9 && hour <= 23 && (minutes == 0 || minutes == 30))) {
        DisplayError(modal.target.querySelector('#modal-errors'), 'Доступно только время с 9 до 23 часов, каждые 30 минут!');
        btn.classList.add('disabled');
        return;
    }
    if (date == '' || time == '') {
        DisplayError(modal.target.querySelector('#modal-errors'), 'Необходимо указать время и дату!');
        btn.classList.add('disabled');
        return;
    }
    

    let isWeekend = GetDatePrice(date);
    let morningPrice = hour >= 9 && hour < 12 ? 400 : 0;
    let eveningPrice = hour >= 20 && hour < 23 ? 1000 : 0;
    let visitorsPrice = count < 5 ? 0 : count < 10 ? 1000 : 1500;
    let option1Price = option1 ? (isWeekend ? 0.3 : 0.25) : 0;
    let option2Price = option2 ? selectedGuide.pricePerHour * 0.5 : 0;

    btn.classList.remove('disabled');
    let price = selectedGuide.pricePerHour * duration * (1 + option1Price) + morningPrice + eveningPrice + visitorsPrice + option2Price;
    price = Math.round(price);

    modal.target.querySelector('#price').innerHTML = price;

    btn.onclick = async () => {
        let form = new FormData();
        form.append('guide_id', selectedGuide.id);
        form.append('route_id', selectedRoute.id);
        form.append('date', date);
        form.append('time', time);
        form.append('duration', duration);
        form.append('persons', count);
        form.append('price', price);
        form.append('optionFirst', +option1);
        form.append('optionSecond', +option2);

        try {
            let response = await fetch(GetUrl('orders'), {
                method: 'POST',
                body: form
            });
    
            if (!response.ok) {
                throw new Error('Ошибка сервера');
            }
    
            document.querySelector('#modal-close').click();
            btn.classList.remove('disabled');
    
            // Получаем заказы заново после отправки нового заказа
            await GetOrders();
    
            // Обновляем отображение заказов
            DisplayOrder(currentPage);
    
            // Переключаемся на вкладку "Личный кабинет" (если есть такая вкладка)
            let personalTab = document.querySelector('#personal-tab');
            if (personalTab) {
                personalTab.click();
            } else {
                // Если вкладка "Личный кабинет" отсутствует, можно добавить логику перехода на нужную страницу
                window.location.href = 'personal.html';
            }
        } catch (error) {
            DisplayError(modal.target.querySelector('#modal-errors'), 'Ошибка при отправке заказа: ' + error.message);
        }
    };
}

window.onload = async () => {
    await GetRoutes();
    SetObjects();


    let routesForm = document.getElementById('routes-form');
    routesForm.onsubmit = (event) => {
        event.preventDefault();
        SearchRoute(routesForm);
    };
    let select = document.getElementById('objects');
    select.onchange = function () {
        SearchRoute(routesForm);
    }

    let guideForm = document.getElementById('guide-form');
    guideForm.onsubmit = (event) => {
        event.preventDefault();
        SearchGuide(guideForm);
    };

    document.getElementById('orderModal').addEventListener('show.bs.modal', function (event) {
        event.target.querySelector('#fullname').innerHTML = selectedGuide.name;
        event.target.querySelector('#route-name').innerHTML = selectedRoute.name;
        event.target.querySelector('#time').value = '9:00';
        event.target.querySelector('#date').value = Date.now();

        event.target.querySelector('#duration').onchange = () => UpdateForm(event);
        event.target.querySelector('#count').oninput = () => UpdateForm(event);
        event.target.querySelector('#time').onchange = () => UpdateForm(event);
        event.target.querySelector('#date').onchange = () => UpdateForm(event);
        event.target.querySelector('#option1').onchange = () => UpdateForm(event);
        event.target.querySelector('#option2').onchange = () => UpdateForm(event);
    });
}
