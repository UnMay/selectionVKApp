// подключаем React
import React from 'react';
// Подключаем коннект, для работы с методами ВК
import connect from '@vkontakte/vkui-connect';
// Подключаем UI компоненты, чтобы страница смотрелась похоже на вк
import { View, Panel, List, Button, Group, Div, Cell, PanelHeader, Avatar } from '@vkontakte/vkui';
// Подключаем необходимые таблицы стилей, чтобы не поехала верстка
import '@vkontakte/vkui/dist/vkui.css';

// переменная с айди приложения
var app_id = 7005147

// Создаем основной класс App, который является
// React компонентом, в котором все и будет происходить
class App extends React.Component {
	// Инициализируем конструктор для работы с this и пропсами
	constructor(props) {
		super(props);
		// Наш основной объект с данными
		this.state = {
			user_id: null, // Понадобится для отправки метода groups.get
			groups: [
				{
					photo: "https://pp.userapi.com/c638928/v638928079/2a8b1/eYJXY8I0dIc.jpg?ava=1",
					name: "ИнФО",
					link: "https://vk.com/urfu_info"
				},
				{
					photo: "https://sun9-19.userapi.com/c849532/v849532311/44522/QTQuB9pRmcI.jpg?ava=1",
					name: "ИГУП",
					link: "https://vk.com/igup_urfu"
				},
				{
					photo: "https://sun9-2.userapi.com/c847120/v847120164/1ff2bb/BNVUAqDd06E.jpg?ava=1",
					name: "ВШЭМ",
					link: "https://vk.com/urfu_gsem"
				},
			], // Сюда положу массив из групп
			access_token: null, // Здесь будет токен, чтобы отправить запрос к апи
			index: null // Это индекс главной группы, которую выберет рандом
		};
	}

	// Функция, которая выполнится в самом начале загрузки страницы
	componentDidMount() {
		// Функция, которая отлавливает все запросы VKConnect
		connect.subscribe((e) => {
			// Условие на разные типы запросов
			switch (e.detail.type) {
				// Приходит инфа о пользователе
				case 'VKWebAppGetUserInfoResult':
					// Кладем в объект this.state.user_id айди пользователя
					this.setState({ user_id: e.detail.data.id });
					break;
				// Когда пользователь дал токен
				case 'VKWebAppAccessTokenReceived':
					// Отправляем метод groups.get с необходимыми параметрами и request_id
					connect.send("VKWebAppCallAPIMethod", {"method": "groups.get", "request_id": "1", "params": {"user_id": this.state.user_id, "count": 100, "extended": 1, "v":"5.95", "fields": "activity", "access_token":e.detail.data.access_token}});
					break;
				// Если вызов апи успешен
				case 'VKWebAppCallAPIMethodResult':
					if(e.detail.data.request_id === "1"){
						var ids = e.detail.data.response.items.map((item) => item.id);
						fetch('https://instituteselectionvk.ru/predict', {
							method: 'POST',
							headers: {
								'Accept': 'application/json',
								'Content-Type': 'application/json'
							},
							body: JSON.stringify([Number(this.state.user_id),ids])
						})
							.then(response => response.json())
							.then(data => {
								this.setState({index: data})
							})
					}
					break;
				default:
			}
		});
		// Когда открывается приложения сразу отправляю запрос для получения инфы о юзере
		connect.send('VKWebAppGetUserInfo', {});
	}
	// Рендер приложения
	render() {
		// Здесь возвращаю пользователю JSX(html)
		return (
			// Рисую view
			<View activePanel="home">
				{/* Рисую панель */}
				<Panel id="home">
					<PanelHeader>Подбор института</PanelHeader>
					{
						// Здесь проверяю есть ли в this.state.index что-нибудь, если нет
						// отображаю кнопку получить подписки
						!this.state.index ?
							<div>
								{/* Отрисовываю вкшные компоненты, чтобы выглядело ок */}
								<Group>
									<Div>
										{/* в функции onClick, то бишь на нажатие
										будет вызываться событие вк, для получения токена пользователя с
										разрешением "группы"
									*/}
										<Button size="xl" level="2" onClick={() => connect.send("VKWebAppGetAuthToken", {"app_id": app_id, "scope": "groups"})}>
											Подобрать институт основываясь на подписках
										</Button>
									</Div>
								</Group>
							</div>
							// Если же this.state.groups !== false отрисовываю то, что ниже
							:
							<Group style={{padding: "10px"}}>
								<center>
									{/* this.state.index имеет значение 0/1/2 и получаю группы с таким индексом */}
									<img height="200px" alt="first_groups" src={this.state.groups[this.state.index].photo} /> <br />
									<p>Вам подходит институт {this.state.groups[this.state.index].name}</p>
								</center>
							</Group>
					}
					<Group>
						<List>
							{/* Отрисовываются компоненты ссылки */}
							{
								// Юзаю метод массивов мап, чтобы пробежаться по
								// всему массиву и отобразить ячейки
								this.state.groups && this.state.groups.map((group, i) =>
									<Cell
										key={i}
										component="a"
										target="_blank"
										href={group.link}
										before={<Avatar src={group.photo} />}
									>{group.name}</Cell>
								)
							}
						</List>
					</Group>
				</Panel>
			</View>
		);
	}
}
// Экспортирую класс App, чтобы index.js его получил
export default App;
