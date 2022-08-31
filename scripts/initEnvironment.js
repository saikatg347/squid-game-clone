import * as THREE from 'three'

export function initCamera() {
	const camera = new THREE.PerspectiveCamera(
		60,
		window.innerWidth / window.innerHeight,
		0.1,
		1000.0
	)
	camera.position.set(25, 10, 25)
	return camera
}

export function initLighting(scene) {
	let directionalLight = new THREE.DirectionalLight(0xffffff, 1.0)
	directionalLight.position.set(-100, 100, 100)
	directionalLight.target.position.set(0, 0, 0)
	directionalLight.castShadow = true
	directionalLight.shadow.bias = -0.001
	directionalLight.shadow.mapSize.width = 4096
	directionalLight.shadow.mapSize.height = 4096
	directionalLight.shadow.camera.near = 0.1
	directionalLight.shadow.camera.far = 500.0
	directionalLight.shadow.camera.near = 0.5
	directionalLight.shadow.camera.far = 500.0
	directionalLight.shadow.camera.left = 500
	directionalLight.shadow.camera.right = -500
	directionalLight.shadow.camera.top = 500
	directionalLight.shadow.camera.bottom = -500
	scene.add(directionalLight)

	const ambientLight = new THREE.AmbientLight(0xffffff, 0.25)
	scene.add(ambientLight)
}

export function initBackground(scene) {
	const loader = new THREE.CubeTextureLoader()
	const texture = loader.load([
		'../assets/background/box-right.bmp',
		'../assets/background/box-left.bmp',
		'../assets/background/box-top.bmp',
		'../assets/background/box-bottom.bmp',
		'../assets/background/box-front.bmp',
		'../assets/background/box-back.bmp',
	])
	texture.encoding = THREE.sRGBEncoding
	scene.background = texture
}

export function initFloor(scene) {
	const textureLoader = new THREE.TextureLoader()
	const floorBaseColor = textureLoader.load('../assets/floor/COLOR.jpg')
	const floorNormalMap = textureLoader.load('../assets/floor/NRM.jpg')
	const floorHeightMap = textureLoader.load('../assets/floor/DISP.jpg')
	const floorAmbientOcclusion = textureLoader.load('../assets/floor/OCC.jpg')

	const floorMaterial = new THREE.MeshStandardMaterial({
		map: floorBaseColor,
		normalMap: floorNormalMap,
		displacementMap: floorHeightMap,
		displacementScale: 0.1,
		aoMap: floorAmbientOcclusion,
	})
	wrapAndRepeatTexture(floorMaterial.map)
	wrapAndRepeatTexture(floorMaterial.normalMap)
	wrapAndRepeatTexture(floorMaterial.displacementMap)
	wrapAndRepeatTexture(floorMaterial.aoMap)
	const floor = new THREE.Mesh(
		new THREE.PlaneGeometry(500, 500, 10, 10),
		floorMaterial
	)

	floor.castShadow = false
	floor.receiveShadow = true
	floor.rotation.x = -Math.PI / 2
	scene.add(floor)
}

function wrapAndRepeatTexture(map) {
  map.wrapS = map.wrapT = THREE.RepeatWrapping
  map.repeat.x = map.repeat.y = 10
}

export function initWalls(scene) {
	const material = new THREE.MeshBasicMaterial({color: 0x00ff00})
	
	const wall1 = new THREE.Mesh(
		new THREE.BoxGeometry(500, 200, 4),
		material);
	wall1.position.set(0, 0, -250);
	wall1.castShadow = true;
	wall1.receiveShadow = true;
	scene.add(wall1);

	const wall2 = new THREE.Mesh(
		new THREE.BoxGeometry(500, 200, 4),
		material);
	wall2.position.set(0, 0, 250);
	wall2.castShadow = true;
	wall2.receiveShadow = true;
	scene.add(wall2);

	const wall3 = new THREE.Mesh(
		new THREE.BoxGeometry(4, 200, 500),
		material);
	wall3.position.set(250, 0, 0);
	wall3.castShadow = true;
	wall3.receiveShadow = true;
	scene.add(wall3);

	const wall4 = new THREE.Mesh(
		new THREE.BoxGeometry(4, 200, 500),
		material);
	wall4.position.set(-250, 0, 0);
	wall4.castShadow = true;
	wall4.receiveShadow = true;
	scene.add(wall4);
}