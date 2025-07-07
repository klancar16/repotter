export type PotId = string;

export type PotType = {
    id: PotId;
    pot_size: number;
    has_plant: boolean;
    size_increase: number;
    needs_a_stick_size: number;
    note: string;
    retired: boolean;
};
