## server mode usage

```
docker-compose up -d
```

```
fetch('http://localhost/?text='+encodeURIComponent('明日休みます'))
  .then(res => res.text())
  .then((ret)=>console.log(ret));
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
