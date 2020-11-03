import glob from 'glob';
import jsyaml from 'js-yaml';
import path from 'path';
import md5 from 'md5';
import {readFile, writeFile} from 'fs/promises';
import {promisify} from 'util';

const outputDir = path.resolve('output');

function main() {
  return Promise.all([
    promisify(glob)('series/*.yml')
      .then((files) => Promise.all(files.map((file) => readFile(file))))
      .then((buffers) =>
        Promise.all(buffers.map((buffer) => jsyaml.safeLoad(buffer))),
      )
      .then((array) =>
        array.map(({title, books, authors}) => ({
          series: {
            _id: md5(title),
            title,
            books: books.map(({title: bookTitle, ...book}) => ({
              ...book,
              book: md5(bookTitle),
            })),
            relatedAuthors: authors.map((author) => md5(author.name)),
          },
          books: books.map(({serial, ...book}) => ({
            ...book,
            _id: md5(book.title),
            authors: authors.map(({name, ...author}) => ({
              ...author,
              author: md5(name),
            })),
          })),
          authors: authors.map(({roles, ...author}) => ({
            ...author,
            _id: md5(author.name),
          })),
        })),
      )
      .then((array) =>
        array.reduce(
          (pre, cur) => ({
            series: [...pre.series, cur.series],
            books: [...pre.books, ...cur.books],
            authors: [...pre.authors, ...cur.authors],
          }),
          {
            books: [],
            authors: [],
            series: [],
          },
        ),
      )
      .then(({series, authors, books}) =>
        Promise.all([
          writeFile(
            path.resolve(outputDir, 'series.json'),
            JSON.stringify(series),
          ),
          writeFile(
            path.resolve(outputDir, 'authors.json'),
            JSON.stringify(authors),
          ),
          writeFile(
            path.resolve(outputDir, 'books.json'),
            JSON.stringify(books),
          ),
        ]),
      ),
  ]);
}

main();
