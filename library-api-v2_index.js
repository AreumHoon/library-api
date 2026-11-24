const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 초기 샘플 도서 데이터
let books = [
  {
    id: 1,
    title: '클린 코드 (Clean Code)',
    author: '로버트 C. 마틴',
    publisher: '인사이트',
    year: 2013,
    isbn: '9788966260959',
    available: true
  },
  {
    id: 2,
    title: '모던 자바스크립트 Deep Dive',
    author: '이웅모',
    publisher: '위키북스',
    year: 2020,
    isbn: '9791158392239',
    available: true
  },
  {
    id: 3,
    title: 'Node.js 교과서',
    author: '조현영',
    publisher: '길벗',
    year: 2022,
    isbn: '9791140700394',
    available: false
  }
];

let nextId = 4;

// 루트 경로: 브라우저 접속 시 API 명세 및 실시간 CRUD 테스트 페이지 제공
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>도서관리 프로그램 REST API</title>
      <style>
        body { font-family: 'Malgun Gothic', sans-serif; max-width: 900px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #222; }
        h1 { color: #1b365d; border-bottom: 2px solid #1b365d; padding-bottom: 10px; }
        .card { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ced4da; padding: 10px; text-align: left; }
        th { background: #1b365d; color: #fff; }
        input, button { padding: 8px 12px; margin: 4px 2px; border: 1px solid #ccc; border-radius: 4px; }
        button { background: #1b365d; color: #fff; cursor: pointer; border: none; }
        button:hover { background: #2c5282; }
        .badge-ok { color: #155724; background: #d4edda; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
        .badge-no { color: #721c24; background: #f8d7da; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
      </style>
    </head>
    <body>
      <h1>📚 NodeJS 도서관리 프로그램 API</h1>
      <div class="card">
        <h3>REST API 엔드포인트 명세</h3>
        <table>
          <tr><th>Method</th><th>Endpoint</th><th>설명</th></tr>
          <tr><td>GET</td><td><a href="/api/books" target="_blank">/api/books</a></td><td>전체 도서 목록 조회 (검색: ?search=키워드)</td></tr>
          <tr><td>GET</td><td><a href="/api/books/1" target="_blank">/api/books/:id</a></td><td>특정 도서 상세 조회</td></tr>
          <tr><td>POST</td><td>/api/books</td><td>신규 도서 등록 (JSON: title, author, publisher, year, isbn)</td></tr>
          <tr><td>PUT</td><td>/api/books/:id</td><td>도서 정보 수정 및 대출 상태 변경</td></tr>
          <tr><td>DELETE</td><td>/api/books/:id</td><td>도서 삭제</td></tr>
        </table>
      </div>

      <div class="card">
        <h3>신규 도서 등록 테스트</h3>
        <input id="title" placeholder="도서명 (필수)" />
        <input id="author" placeholder="저자 (필수)" />
        <input id="publisher" placeholder="출판사" />
        <input id="year" type="number" placeholder="출판연도" />
        <button onclick="addBook()">도서 등록</button>
      </div>

      <div class="card">
        <h3>현재 등록된 도서 목록</h3>
        <div id="book-list">불러오는 중...</div>
      </div>

      <script>
        async function loadBooks() {
          const res = await fetch('/api/books');
          const result = await res.json();
          const listDiv = document.getElementById('book-list');
          if (!result.data.length) {
            listDiv.innerHTML = '<p>등록된 도서가 없습니다.</p>';
            return;
          }
          let html = '<table><tr><th>ID</th><th>도서명</th><th>저자</th><th>출판사</th><th>상태</th><th>관리</th></tr>';
          result.data.forEach(b => {
            html += '<tr>' +
              '<td>' + b.id + '</td>' +
              '<td>' + b.title + '</td>' +
              '<td>' + b.author + '</td>' +
              '<td>' + (b.publisher || '-') + '</td>' +
              '<td>' + (b.available ? '<span class="badge-ok">대출가능</span>' : '<span class="badge-no">대출중</span>') + '</td>' +
              '<td>' +
                '<button onclick="toggleStatus(' + b.id + ',' + !b.available + ')">상태변경</button> ' +
                '<button style="background:#c53030" onclick="deleteBook(' + b.id + ')">삭제</button>' +
              '</td></tr>';
          });
          html += '</table>';
          listDiv.innerHTML = html;
        }

        async function addBook() {
          const title = document.getElementById('title').value.trim();
          const author = document.getElementById('author').value.trim();
          const publisher = document.getElementById('publisher').value.trim();
          const year = document.getElementById('year').value;
          if (!title || !author) return alert('도서명과 저자를 입력하세요.');
          await fetch('/api/books', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, author, publisher, year: year ? Number(year) : 2026 })
          });
          document.getElementById('title').value = '';
          document.getElementById('author').value = '';
          document.getElementById('publisher').value = '';
          document.getElementById('year').value = '';
          loadBooks();
        }

        async function toggleStatus(id, available) {
          await fetch('/api/books/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ available })
          });
          loadBooks();
        }

        async function deleteBook(id) {
          await fetch('/api/books/' + id, { method: 'DELETE' });
          loadBooks();
        }

        loadBooks();
      </script>
    </body>
    </html>
  `);
});

// 1. 전체 도서 조회 (GET /api/books)
app.get('/api/books', (req, res) => {
  const { search } = req.query;
  let result = books;
  if (search) {
    const keyword = search.toLowerCase();
    result = books.filter(
      (b) =>
        b.title.toLowerCase().includes(keyword) ||
        b.author.toLowerCase().includes(keyword)
    );
  }
  res.status(200).json({
    success: true,
    count: result.length,
    data: result
  });
});

// 2. 특정 도서 상세 조회 (GET /api/books/:id)
app.get('/api/books/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const book = books.find((b) => b.id === id);
  if (!book) {
    return res.status(404).json({ success: false, message: '해당 ID의 도서를 찾을 수 없습니다.' });
  }
  res.status(200).json({ success: true, data: book });
});

// 3. 신규 도서 등록 (POST /api/books)
app.post('/api/books', (req, res) => {
  const { title, author, publisher, year, isbn, available } = req.body;
  if (!title || !author) {
    return res.status(400).json({ success: false, message: '도서명(title)과 저자(author)는 필수 항목입니다.' });
  }
  const newBook = {
    id: nextId++,
    title,
    author,
    publisher: publisher || '미상',
    year: year || new Date().getFullYear(),
    isbn: isbn || '',
    available: available !== undefined ? Boolean(available) : true
  };
  books.push(newBook);
  res.status(201).json({ success: true, message: '도서가 등록되었습니다.', data: newBook });
});

// 4. 도서 정보 수정 (PUT /api/books/:id)
app.put('/api/books/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = books.findIndex((b) => b.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: '해당 ID의 도서를 찾을 수 없습니다.' });
  }
  const { title, author, publisher, year, isbn, available } = req.body;
  books[index] = {
    ...books[index],
    title: title !== undefined ? title : books[index].title,
    author: author !== undefined ? author : books[index].author,
    publisher: publisher !== undefined ? publisher : books[index].publisher,
    year: year !== undefined ? year : books[index].year,
    isbn: isbn !== undefined ? isbn : books[index].isbn,
    available: available !== undefined ? Boolean(available) : books[index].available
  };
  res.status(200).json({ success: true, message: '도서 정보가 수정되었습니다.', data: books[index] });
});

// 5. 도서 삭제 (DELETE /api/books/:id)
app.delete('/api/books/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = books.findIndex((b) => b.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: '해당 ID의 도서를 찾을 수 없습니다.' });
  }
  const deleted = books.splice(index, 1)[0];
  res.status(200).json({ success: true, message: '도서가 삭제되었습니다.', data: deleted });
});

app.listen(PORT, () => {
  console.log(`도서관리 API 서버가 포트 ${PORT}번에서 실행 중입니다.`);
});
