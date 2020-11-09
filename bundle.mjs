import path from 'path';
import {readFile, writeFile} from 'fs/promises';
import {promisify} from 'util';

import glob from 'glob';
import jsyaml from 'js-yaml';
import md5 from 'md5';

const outputDir = path.resolve('output');

function main() {
  return Promise.all([
    promisify(glob)('series/*.yml')
      .then((files) => Promise.all(files.map((file) => readFile(file))))
      .then((buffers) =>
        Promise.all(buffers.map((buffer) => jsyaml.safeLoad(buffer))),
      )
      .then((array) =>
        array.map(({title, books, relatedBooks, authors, concluded}) => ({
          series: {
            _id: md5(title),
            title,
            concluded,
            books: books.map(({title: bookTitle, ...book}) => ({
              ...book,
              book: md5(bookTitle),
            })),
            relatedBooks:
              relatedBooks?.map((book) => ({
                ...book,
                _id: md5(book.title),
              })) || [],
            relatedAuthors: authors.map((author) => md5(author.name)),
          },
          // eslint-disable-next-line no-unused-vars
          books: books.map(({serial, ...book}) => ({
            ...book,
            _id: md5(book.title),
            isbn: book.isbn ? String(book.isbn) : null,
            authors: authors.map(({name, ...author}) => ({
              ...author,
              author: md5(name),
            })),
          })),
          // eslint-disable-next-line no-unused-vars
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
