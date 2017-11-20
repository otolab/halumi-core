## server mode usage

```
docker-compose up -d
```

```javascript
fetch('http://localhost/?text='+encodeURIComponent('明日休みます'))
  .then(res => res.text())
  .then((ret)=>console.log(ret));
```

```bash
$ curl -G http://localhost:80/ --data-urlencode text='明日は休みです'
```

```
docker-compose down -v
```


## demo.js

```
docker-compose up -d
docker-compose exec halumi bash
```

```bash
$ cd halumi
$ node demo/demo.js
```

```
docker-compose down -v
```
