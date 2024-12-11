import React, { useState, useRef } from 'react';
import { Editor } from '@toast-ui/react-editor'; // Toast UI Editor import
import '@toast-ui/editor/dist/toastui-editor.css'; 
import '@toast-ui/editor/dist/i18n/ko-kr';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";  // 스타일 불러오기


const TodoModify = () => {
    const [taskDescription, setTaskDescription] = useState(''); // 상태를 HTML로 저장
    const [calendarVisible, setCalendarVisible] = useState(false); // 캘린더 표시 여부
    const editorRef = useRef(null); // 에디터 참조

    const handleTaskDescriptionChange = () => {
      const htmlContent = editorRef.current.getInstance().getHTML(); // 수정된 부분
      setTaskDescription(htmlContent); // 상태 업데이트
    };

    const handleClickCalendar = () => {
        setCalendarVisible(!calendarVisible); // 캘린더 토글
    };

    return (
    <div>
        <div style={{display:'flex', paddingBottom:'10px'}}>
            <span onClick={handleClickCalendar} style={{ cursor: 'pointer' }}>📅</span>
            <span style={{margin:'0 10px'}}>|</span>
            <span>🚩</span>
        </div>
        {calendarVisible && (
            <div 
            style={{
                position: 'absolute', // 캘린더를 절대 위치로 설정
                zIndex: 9999, // 다른 요소 위로 출력
                backgroundColor: 'white', // 배경색 설정
                border: '1px solid #ccc', // 경계선 설정
                borderRadius: '5px', // 모서리 둥글게
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', // 그림자 효과
                padding: '10px', // 내부 여백
            }}
        >
            <DatePicker
                selected={new Date()}
                onChange={(date) => console.log(date)} // 날짜 선택 시 처리
                inline
            />
        </div>
        )}
        <div className="mb-3">
            <input
              type="text"
              className="form-control"
            />
        </div>
        <Editor
            ref={editorRef}
            value={taskDescription}
            onChange={handleTaskDescriptionChange}
            previewStyle="vertical" 
            height="80vh"
            width="100%"
            initialEditType="wysiwyg"
            language="ko-KR" 
            hideModeSwitch={true}
            toolbarItems={[
                ['bold', 'italic', 'strike'], 
                ['ul', 'ol', 'task', 'indent', 'outdent'], 
                ['hr', 'quote'], 
                ['link'] 
            ]}
        />
    </div>
  );
};

export default TodoModify;
