import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../css/calendarStyle.css';


const FetchCalendar = () => {
  const [value, setValue] = useState(new Date());
  const [events, setEvents] = useState({}); // 일정 데이터를 저장

  // 서버에서 일정 데이터 가져오기
  const fetchEvents = async () => {
    try {
      const response = await fetch('https://example.com/api/events'); // API URL
      const data = await response.json();

      // 데이터를 가공하여 { 날짜: [일정 목록] } 형태로 변환
      const eventMap = data.reduce((acc, item) => {
        acc[item.date] = item.events;
        return acc;
      }, {});

      setEvents(eventMap); // 일정 데이터 상태 업데이트
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  // 컴포넌트 로드 시 데이터 가져오기
  useEffect(() => {
    fetchEvents();
  }, []);

  // 특정 날짜에 일정 표시
  const getTileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateString = date.toISOString().split('T')[0];
      const eventList = events[dateString];

      if (eventList) {
        return (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: '0.8rem', color: '#333' }}>
            {eventList.map((event, index) => (
              <li key={index} style={{ textAlign: 'left', padding: '2px 0' }}>
                • {event}
              </li>
            ))}
          </ul>
        );
      }
    }
    return null;
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
