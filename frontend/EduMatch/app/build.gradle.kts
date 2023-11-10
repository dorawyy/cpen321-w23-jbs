import org.gradle.internal.classpath.Instrumented.systemProperties
import org.gradle.internal.classpath.Instrumented.systemProperty
import java.util.Properties
plugins {
    id("com.android.application")
    id("com.google.android.libraries.mapsplatform.secrets-gradle-plugin")
    id("jacoco")
}

android {
    namespace = "com.example.edumatch"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.example.edumatch"
        minSdk = 26
        targetSdk = 33
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"

        val localProperties = Properties()
        localProperties.load(File("local.properties").inputStream())
        val mapsApiKey = localProperties.getProperty("MAPS_API_KEY")

// Now you can use the mapsApiKey variable
        buildConfigField("String", "MAPS_API_KEY", "\"$mapsApiKey\"")
    }

    buildFeatures {
        buildConfig = true
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            enableAndroidTestCoverage = true
        }
        debug {
            enableAndroidTestCoverage = true
        }

    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }

    testOptions {
        unitTests {
            isReturnDefaultValues = true
        }
    }

    buildTypes {
        getByName("debug") {
            enableAndroidTestCoverage = true // Enable test coverage for the debug build type
        }
        // ...
    }


}



dependencies {
    implementation("com.google.oauth-client:google-oauth-client-jetty:1.23.0")
    implementation ("com.google.apis:google-api-services-calendar:v3-rev305-1.23.0")
    implementation("com.google.android.gms:play-services-maps:18.1.0")
    implementation("com.google.android.libraries.places:places:2.6.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.10.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
    implementation("androidx.gridlayout:gridlayout:1.0.0")
    implementation("com.google.android.gms:play-services-base:18.2.0")
    implementation("com.google.android.gms:play-services-auth:20.7.0")
    implementation ("com.google.android.flexbox:flexbox:3.0.0")
    implementation("com.squareup.okhttp3:okhttp:4.9.1")
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test:rules:1.5.0")
    androidTestImplementation("androidx.test:runner:1.5.2")
//    testImplementation("androidx.test.espresso:espresso-core:3.5.1")
    testImplementation("org.robolectric:robolectric:4.6.1")
    implementation("net.bytebuddy:byte-buddy:1.14.9")
    testImplementation("net.bytebuddy:byte-buddy-agent:1.14.9")
    testImplementation("org.objenesis:objenesis:3.3")
    testImplementation("androidx.arch.core:core-testing:2.2.0")


    // To avoid conflicts in libraries
    implementation("com.google.guava:listenablefuture:9999.0-empty-to-avoid-conflict-with-guava")

    implementation("com.google.api-client:google-api-client-android:1.23.0") {
        exclude(group = "org.apache.httpcomponents")
    }

// So that we can easily control permissions
    implementation("pub.devrel:easypermissions:3.0.0")
    implementation("androidx.recyclerview:recyclerview:1.3.2")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
    androidTestImplementation("androidx.test.espresso:espresso-contrib:3.5.1")
    implementation("com.android.support:recyclerview-v7:23.2.0")
    testImplementation("org.json:json:20140107")
    androidTestImplementation("org.mockito:mockito-android:5.7.0")
//    testImplementation("org.mockito:mockito-core:5.7.0")
    androidTestImplementation("androidx.test.espresso:espresso-intents:3.5.1")
//    androidTestImplementation("org.mockito:mockito-inline:5.2.0")




}


jacoco {
    toolVersion = "0.8.11" // Use the appropriate version
}
