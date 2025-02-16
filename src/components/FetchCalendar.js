import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../css/calendarStyle.css';


const FetchCalendar = () => {
  const [value, setValue] = useState(new Date());
  const [events, setEvents] = useState({});

  const fetchEvents = async () => {
    try {
        const year = value.getFullYear();  
        const month = value.getMonth() + 1;  

        const requestUrl = `http://localhost:8081/calendar/${year}-${month < 10 ? '0' + month : month}`;
  
        const response = await fetch(requestUrl, {credentials: 'include',}); 
        console.log(response)
        if(response.ok){
            const data = await response.json();
            console.log(data.todos)
            const eventsByDate = data.reduce((acc, { date, todos }) => {
                const dateString = date; // date는 'YYYY-MM-DD' 형식으로 제공된다고 가정
                acc[dateString] = todos || []; // todos가 없으면 빈 배열로 처리
                return acc;
              }, {});
      
              setEvents(eventsByDate); // 상태 업데이트
            }
          } catch (error) {
            console.error('Failed to fetch events:', error);
          }
        };
      
        useEffect(() => {
          fetchEvents();
        }, [value]); // value가 바뀔 때마다 다시 fetch
      
        // 특정 날짜에 일정 표시
        const getTileContent = ({ date, view }) => {
          if (view === 'month') {
            const adjustedDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
            const dateString = adjustedDate.toISOString().split('T')[0]; 
            const eventList = events[dateString];
            
            if (eventList && eventList.length > 0) {
                const sortedEventList = [...eventList].sort((a, b) => a.priority - b.priority);
              return (
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: '0.8rem', color: '#333', width:'100%'}}>
                  {sortedEventList.map((event, index) => (
                    <li
                    key={index}
                    style={{
                      textAlign: 'left',
                      padding: '2px 5px',
                      backgroundColor: getPriorityColor(event.priority), // 우선 순위에 따른 배경색 설정
                      borderRadius: '4px', // 좀 더 보기 좋게 둥근 모서리 추가
                      marginBottom: '2px',
                      width: '100%',
                    }}
                  >
                        {event.title} {/* event는 'todos' 배열의 항목들 */}
                    </li>
                  ))}
                </ul>
              );
            }
          }
          return null;
        };

        const getPriorityColor = (priority) => {
            switch (priority) {
              case 1:
                return '#FFAAAA';
              case 2:
                return '#FFCC99';
              case 3:
                return '#A9D1FF';
              case 4:
                return "#A8E0A6 ";
              default:
                return '#d9d9d9'; // 회색 (우선 순위 없음)
            }
          };
      

  return (
      <Calendar
        onChange={setValue}
        value={value}
        className="custom-calendar"
        tileContent={getTileContent} // 날짜별 일정 표시
      />
  );
};

export default FetchCalendar;
