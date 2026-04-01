import { getPermissionsAsync, requestPermissionsAsync, SchedulableTriggerInputTypes, scheduleNotificationAsync, setNotificationHandler } from "expo-notifications";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

jest.mock("expo-notifications", () => ({
    requestPermissionsAsync: jest.fn(),
    getPermissionsAsync: jest.fn(),
    scheduleNotificationAsync: jest.fn(),
    setNotificationHandler: jest.fn(),
    SchedulableTriggerInputTypes: {
        TIME_INTERVAL: 'timeInterval',
    },
}));

describe("<NotificationsScreen />", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

describe("Notification Permissions", () => {
    test("requests notification permissions on mount", async () => {
        (requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
        require('@/app/(tabs)/notifications');
        expect(requestPermissionsAsync).toHaveBeenCalled();
    });

    test("shows alert if permissions are denied", async () => {
        (requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
        const alertMock = jest.spyOn(global, 'alert').mockImplementation(() => {});
        require('@/app/(tabs)/notifications');
        expect(alertMock).toHaveBeenCalledWith('Permission required', 'Please enable notifications to receive updates about your plants.');
        alertMock.mockRestore();
    });
});

describe("Triggering Notifications", () => {
    test("schedules a notification when triggerNotification is called", async () => {
        (get as jest.Mock).mockReturnValue({ status: 'granted' });
        const { triggerNotification } = require('@/app/(tabs)/notifications');
        await triggerNotification();
        expect(scheduleNotificationAsync).toHaveBeenCalledWith({
            content: {
                title: "Alert from PlantWatch",
                body: "Your plant needs watering!",
            },
            trigger: { 
                type: SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds: 5,
                repeats: false,
             }, 
        });
    });

    test("shows alert if permissions are not granted when triggering notification", async () => {
        (get as jest.Mock).mockReturnValue({ status: 'denied' });
        const alertMock = jest.spyOn(global, 'alert').mockImplementation(() => {});
        const { triggerNotification } = require('@/app/(tabs)/notifications');
        await triggerNotification();
        expect(alertMock).toHaveBeenCalledWith('Permission required', 'Please enable notifications to receive updates about your plants.');
        alertMock.mockRestore();
    });
});
});