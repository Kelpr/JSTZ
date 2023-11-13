const sqlite3 = require('sqlite3').verbose();
const readline = require('readline');
const async = require('async');

// Создание и открытие базы данных
const db = new sqlite3.Database('./notes.db', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the SQlite database.');
});

// Создание интерфейса для чтения данных из консоли
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Создание таблицы заметок, если она не существует
db.run("CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, content TEXT)");

// Функция добавления новой заметки
function addNote() {
  rl.question('Enter note title: ', (title) => {
    rl.question('Enter note content: ', (content) => {
      // Добавление заметки в базу данных
      db.run(`INSERT INTO notes (title, content) VALUES (?, ?)`, [title, content], function(err) {
        if (err) {
          return console.error(err.message);
        }
        console.log(`Note added with ID: ${this.lastID}`);
      });
    });
  });
}

// Функция для просмотра всех заметок
function viewNotes() {
  // Выборка всех заметок из базы данных
  db.each("SELECT id, title, content FROM notes", (err, row) => {
    if (err) {
      console.error(err.message);
    }
    console.log(`${row.id}: ${row.title} - ${row.content}`);
  });
}

// Функция для поиска заметок
function searchNotes() {
  rl.question('Enter search query: ', (query) => {
    // Поиск заметок, содержащих заданный запрос
    db.each(`SELECT id, title, content FROM notes WHERE content LIKE ?`, [`%${query}%`], (err, row) => {
      if (err) {
        console.error(err.message);
      }
      console.log(`${row.id}: ${row.title} - ${row.content}`);
    });
  });
}

// Функция для удаления заметки
function deleteNote() {
  rl.question('Enter note ID to delete: ', (id) => {
    // Удаление заметки по идентификатору
    db.run(`DELETE FROM notes WHERE id = ?`, id, function(err) {
      if (err) {
        return console.error(err.message);
      }
      console.log(`Note deleted, ID: ${id}`);
    });
  });
}

// Функция закрытия приложения
function closeApp() {
  // Закрытие подключения к базе данных
  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Closing the database connection.');
    rl.close();
  });
}

// Основное меню приложения
function mainMenu() {
  console.log("\nNotes Manager");
  console.log("1. Add note");
  console.log("2. View notes");
  console.log("3. Search notes");
  console.log("4. Delete note");
  console.log("5. Exit");
  rl.question('Enter your choice: ', (choice) => {
    switch (choice) {
      case '1':
        addNote();
        break;
      case '2':
        viewNotes();
        break;
      case '3':
        searchNotes();
        break;
      case '4':
        deleteNote();
        break;
      case '5':
        closeApp();
        break;
      default:
        console.log('Invalid choice. Please try again.');
        mainMenu();
    }
  });
}

mainMenu();
