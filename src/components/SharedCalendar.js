import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../css/calendarStyle.css';

const SharedCalendar = () => {
  const [value, setValue] = useState(new Date());
  const [events, setEvents] = useState({});
  const [calendars, setCalendars] = useState([]); // 사용 가능한 캘린더 목록
  const [currentCalendar, setCurrentCalendar] = useState(null); // 선택된 캘린더

  // 캘린더 목록 가져오기
  const fetchCalendars = async () => {
    try {
      const response = await fetch('http://localhost:8080/calendar/list'); // 캘린더 목록 API
      if (response.ok) {
        const data = await response.json();
        setCalendars(data); // 캘린더 목록 설정
      }
    } catch (error) {
      console.error('Failed to fetch calendars:', error);
    }
  };

  // 이벤트 데이터 가져오기
  const fetchEvents = async () => {
    if (!currentCalendar) return; // 캘린더가 선택되지 않으면 실행하지 않음

    try {
      const year = value.getFullYear();
      const month = value.getMonth() + 1;
      const requestUrl = `http://localhost:8080/calendar/${currentCalendar.id}/${year}-${month < 10 ? '0' + month : month}`;
      const response = await fetch(requestUrl);

      if (response.ok) {
        const data = await response.json();
        const eventsByDate = data.reduce((acc, { date, todos }) => {
          const dateString = date;
          acc[dateString] = todos || [];
          return acc;
        }, {});
        setEvents(eventsByDate);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  useEffect(() => {
    fetchCalendars(); // 초기 로드 시 캘린더 목록 가져오기
  }, []);

  useEffect(() => {
    fetchEvents(); // currentCalendar 또는 value가 변경되면 이벤트 가져오기
  }, [currentCalendar, value]);

  // 특정 날짜에 일정 표시
  const getTileContent = ({ date, view }) => {
    if (view === 'month') {
      const adjustedDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      const dateString = adjustedDate.toISOString().split('T')[0];
      const eventList = events[dateString];

      if (eventList && eventList.length > 0) {
        const sortedEventList = [...eventList].sort((a, b) => a.priority - b.priority);
        return (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: '0.8rem', color: '#333', width: '100%' }}>
            {sortedEventList.map((event, index) => (
              <li
                key={index}
                style={{
                  textAlign: 'left',
                  padding: '2px 5px',
                  backgroundColor: getPriorityColor(event.priority),
                  borderRadius: '4px',
                  marginBottom: '2px',
                  width: '100%',
                }}
              >
                {event.title}
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
        return '#A8E0A6';
      default:
        return '#d9d9d9';
    }
  };

  return (
    <div>
      {!currentCalendar ? (
        // 캘린더 선택 화면
        <div style={{padding : '5rem'}}>
          <h2>공유 캘린더 선택</h2>
          <ul>
            {calendars.map((calendar) => (
              <li key={calendar.id}>
                <button onClick={() => setCurrentCalendar(calendar)}>{calendar.name}</button>
              </li>
            ))}
          </ul>
          <button onClick={() => console.log('새 캘린더 추가 기능 구현')}>새 캘린더 추가</button>
        </div>
      ) : (
        // 캘린더 화면
        <div>
          <h2>{currentCalendar.name}</h2>
          <button onClick={() => setCurrentCalendar(null)}>다른 캘린더 선택</button>
          <Calendar
            onChange={setValue}
            value={value}
            className="custom-calendar"
            tileContent={getTileContent}
          />
        </div>
      )}
    </div>
  );
};

export default SharedCalendar;
