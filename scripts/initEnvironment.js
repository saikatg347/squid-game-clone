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
	directionalLight.position.set(-200, 200, -200)
	directionalLight.target.position.set(0, 0, 0)
	directionalLight.castShadow = true
	directionalLight.shadow.bias = -0.001
	directionalLight.shadow.mapSize.width = 4096
	directionalLight.shadow.mapSize.height = 4096
	directionalLight.shadow.camera.near = 0.1
	directionalLight.shadow.camera.far = 500.0
	directionalLight.shadow.camera.near = 0.5
	directionalLight.shadow.camera.far = 1000.0
	directionalLight.shadow.camera.left = -500
	directionalLight.shadow.camera.right = 500
	directionalLight.shadow.camera.top = 1000
	directionalLight.shadow.camera.bottom = -1000
	scene.add(directionalLight)

	// const helper = new THREE.CameraHelper( directionalLight.shadow.camera );
	// scene.add( helper );

	const ambientLight = new THREE.AmbientLight(0xffffff, 0.25)
	scene.add(ambientLight)
}

export function initBackground(scene) {
	const loader = new THREE.CubeTextureLoader()
	const texture = loader.load([
		'assets/background/box-right.bmp',
		'assets/background/box-left.bmp',
		'assets/background/box-top.bmp',
		'assets/background/box-bottom.bmp',
		'assets/background/box-front.bmp',
		'assets/background/box-back.bmp',
	])
	texture.encoding = THREE.sRGBEncoding
	scene.background = texture
}

export function initFloor(scene) {
	const textureLoader = new THREE.TextureLoader()
	const floorBaseColor = textureLoader.load('assets/floor/color.jpg')
	const floorNormalMap = textureLoader.load('assets/floor/normal-dx.png')
	const floorHeightMap = textureLoader.load('assets/floor/height.png')
	const floorAmbientOcclusion = textureLoader.load('assets/floor/ao.jpg')

	const floorMaterial = new THREE.MeshPhongMaterial({
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
		new THREE.PlaneGeometry(800, 800, 1, 1),
		floorMaterial
	)

	floor.castShadow = false
	floor.receiveShadow = true
	floor.rotation.x = -Math.PI / 2
	scene.add(floor)
	
	const line = new THREE.Mesh(
		new THREE.BoxGeometry(500, 0.4, 2),
		new THREE.MeshBasicMaterial({color: 0xe3242b})
	)
	line.receiveShadow = true
	line.position.set(0, 0, 290)
	scene.add(line)
}

function wrapAndRepeatTexture(map) {
	map.wrapS = map.wrapT = THREE.RepeatWrapping
	map.repeat.x = map.repeat.y = 10
}
export function initWalls(scene) {
	// field
	const width = 500
	const height = 800

	const loader = new THREE.TextureLoader()
	const texture = loader.load('assets/images/wall-texture.jpg')

	const material = new THREE.MeshPhongMaterial({ map: texture })
	const wall1 = new THREE.Mesh(new THREE.BoxGeometry(width + 10, 160, 4), material)
	wall1.position.set(0, 50, -400)
	wall1.castShadow = true
	wall1.receiveShadow = true
	scene.add(wall1)

	const wall2 = new THREE.Mesh(new THREE.BoxGeometry(width + 10, 160, 4), material)
	wall2.position.set(0, 50, 400)
	wall2.castShadow = true
	wall2.receiveShadow = true
	scene.add(wall2)

	const wall3 = new THREE.Mesh(new THREE.BoxGeometry(4, 160, height + 10), material)
	wall3.position.set(-250, 50, 0)
	wall3.castShadow = true
	wall3.receiveShadow = true
	scene.add(wall3)

	const wall4 = new THREE.Mesh(new THREE.BoxGeometry(4, 160, height + 10), material)
	wall4.position.set(250, 50, 0)
	wall4.castShadow = true
	wall4.receiveShadow = true
	scene.add(wall4)
}
